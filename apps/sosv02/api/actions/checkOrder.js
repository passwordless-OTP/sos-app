import { ActionOptions } from "gadget-server";
import { api } from "../api";
import axios from "axios";

/**
 * Checks an order for fraud risk using the lookup-aggregator service
 * @param { ActionOptions } options
 */
export const run = async ({ params, logger, api }) => {
  const { orderId, email, ipAddress, phoneNumber, shopId } = params;

  logger.info({ orderId, email, ipAddress }, "Starting fraud check");

  try {
    // Initialize response object
    const fraudCheckData = {
      orderId,
      shopId,
      checkedAt: new Date(),
      overallRiskScore: 0,
      recommendation: "allow",
      flaggedReasons: [],
      rawResponses: {}
    };

    // Check if lookup-aggregator service is running
    const LOOKUP_SERVICE_URL = process.env.LOOKUP_SERVICE_URL || "http://localhost:3001";
    
    // First check if service is available
    try {
      await axios.get(`${LOOKUP_SERVICE_URL}/health`, { timeout: 2000 });
    } catch (error) {
      logger.warn("Fraud detection service not available, using default low risk");
      
      // Save a basic fraud check record
      const fraudCheck = await api.fraudCheck.create({
        orderId,
        shopDomain: params.shopDomain || shopId,
        ipAddress,
        email,
        phone: phoneNumber,
        riskScore: 0,
        status: "allow",
        flaggedReasons: ["Fraud service unavailable - defaulting to allow"],
        checkResults: { error: "Service unavailable" },
        checkedAt: new Date()
      });
      
      return {
        success: true,
        fraudCheckId: fraudCheck.id,
        recommendation: "allow",
        riskScore: 0,
        factors: ["Fraud service unavailable - defaulting to allow"]
      };
    }
    
    // Store all check promises
    const checks = [];

    // Check IP address if provided
    if (ipAddress) {
      checks.push(
        axios.post(`${LOOKUP_SERVICE_URL}/api/lookup`, {
          identifier: ipAddress,
          type: "ip"
        }).then(response => ({
          type: "ip",
          identifier: ipAddress,
          result: response.data
        })).catch(error => {
          logger.error({ error: error.message, ipAddress }, "IP lookup failed");
          return null;
        })
      );
    }

    // Check email if provided
    if (email) {
      checks.push(
        axios.post(`${LOOKUP_SERVICE_URL}/api/lookup`, {
          identifier: email,
          type: "email"
        }).then(response => ({
          type: "email",
          identifier: email,
          result: response.data
        })).catch(error => {
          logger.error({ error: error.message, email }, "Email lookup failed");
          return null;
        })
      );
    }

    // Check phone if provided
    if (phoneNumber) {
      checks.push(
        axios.post(`${LOOKUP_SERVICE_URL}/api/lookup`, {
          identifier: phoneNumber,
          type: "phone"
        }).then(response => ({
          type: "phone",
          identifier: phoneNumber,
          result: response.data
        })).catch(error => {
          logger.error({ error: error.message, phoneNumber }, "Phone lookup failed");
          return null;
        })
      );
    }

    // Execute all checks in parallel
    const results = await Promise.all(checks);
    
    // Process results
    let maxScore = 0;
    const allFactors = [];

    for (const checkResult of results) {
      if (!checkResult || !checkResult.result) continue;

      const { type, identifier, result } = checkResult;
      
      // Store raw response
      fraudCheckData.rawResponses[type] = result;

      // Update risk score (take the highest)
      if (result.riskScore > maxScore) {
        maxScore = result.riskScore;
      }

      // Collect risk factors
      if (result.factors && result.factors.length > 0) {
        allFactors.push(...result.factors.map(factor => `${type}: ${factor}`));
      }

      // Log the check result
      logger.info({ 
        type, 
        identifier, 
        riskScore: result.riskScore,
        factors: result.factors 
      }, "Check completed");
    }

    // Set overall risk score and recommendation
    fraudCheckData.overallRiskScore = maxScore;
    fraudCheckData.flaggedReasons = allFactors;

    // Determine recommendation based on score
    if (maxScore >= 75) {
      fraudCheckData.recommendation = "block";
    } else if (maxScore >= 50) {
      fraudCheckData.recommendation = "review";
    } else {
      fraudCheckData.recommendation = "allow";
    }

    // Save fraud check record
    const fraudCheck = await api.fraudCheck.create({
      orderId,
      shopDomain: params.shopDomain || shopId, // Use shopDomain if provided
      ipAddress,
      email,
      phone: phoneNumber,
      riskScore: fraudCheckData.overallRiskScore,
      status: fraudCheckData.recommendation, // Maps to allow/review/block
      flaggedReasons: fraudCheckData.flaggedReasons,
      checkResults: fraudCheckData.rawResponses,
      checkedAt: new Date()
    });

    logger.info({ 
      fraudCheckId: fraudCheck.id,
      recommendation: fraudCheckData.recommendation,
      riskScore: fraudCheckData.overallRiskScore 
    }, "Fraud check completed");

    // Share with network if high risk
    if (fraudCheckData.overallRiskScore >= 50) {
      try {
        await api.networkIntelligence.create({
          threatType: fraudCheckData.recommendation === "block" ? "confirmed_fraud" : "suspicious_activity",
          identifierType: ipAddress ? "ip" : email ? "email" : "phone",
          identifierValue: ipAddress || email || phoneNumber,
          confidence: fraudCheckData.overallRiskScore,
          shopId,
          details: JSON.stringify({
            orderId,
            factors: fraudCheckData.flaggedReasons
          })
        });
        logger.info("Threat intelligence shared with network");
      } catch (error) {
        logger.error({ error: error.message }, "Failed to share network intelligence");
      }
    }

    return {
      success: true,
      fraudCheckId: fraudCheck.id,
      recommendation: fraudCheckData.recommendation,
      riskScore: fraudCheckData.overallRiskScore,
      factors: fraudCheckData.flaggedReasons
    };

  } catch (error) {
    logger.error({ error: error.message, orderId }, "Fraud check failed");
    
    // Return a safe default on error
    return {
      success: false,
      error: error.message,
      recommendation: "review",
      riskScore: 0,
      factors: ["Check failed - manual review recommended"]
    };
  }
};

export const params = {
  orderId: { type: "string", required: true },
  shopId: { type: "string", required: true },
  shopDomain: { type: "string", required: false },
  email: { type: "string", required: false },
  ipAddress: { type: "string", required: false },
  phoneNumber: { type: "string", required: false }
};

export const options = {
  actionType: "custom",
  triggers: {
    api: true
  }
};