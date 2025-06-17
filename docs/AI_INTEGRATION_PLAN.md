# AI Integration Plan for SOS Dashboard

## Overview
Integrate OpenAI API to replace the current pattern-matching system with real AI-powered responses for the Store Assistant feature.

## Current State
- Simple keyword matching (if/else statements)
- Hardcoded responses for most queries
- Real data only for "What were my sales today?"
- No actual AI processing

## Effort Estimate: Medium (2-3 days)

## Implementation Steps

### 1. OpenAI API Setup (2-3 hours)
- [ ] Add OpenAI API key to Gadget environment variables
- [ ] Install OpenAI SDK: `npm install openai`
- [ ] Create API service wrapper at `/api/services/openai.ts`

```typescript
// Example service structure
import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async generateResponse(prompt: string, context: any) {
    // Implementation
  }
}
```

### 2. Create AI Action (3-4 hours)
- [ ] Create `/api/actions/askAI.ts` Gadget action
- [ ] Define input parameters (question, shopId, context)
- [ ] Implement OpenAI integration
- [ ] Return structured response

```typescript
// /api/actions/askAI.ts
export async function run({ params, api, logger }) {
  const { question, shopId } = params;
  
  // Gather context
  const context = await gatherShopContext(shopId, api);
  
  // Generate AI response
  const response = await openAIService.generateResponse(question, context);
  
  return {
    success: true,
    response
  };
}
```

### 3. Enhance Context Gathering (4-5 hours)
- [ ] Create context builder function
- [ ] Implement data fetching based on question intent:
  - Sales data from Shopify Orders API
  - Fraud check history from fraudCheck model
  - Inventory levels from Products API
  - Customer information from Customers API
- [ ] Format context for AI consumption

```typescript
async function gatherShopContext(shopId: string, api: any) {
  return {
    recentSales: await getRecentSales(shopId, api),
    fraudActivity: await getFraudCheckSummary(shopId, api),
    inventory: await getInventoryStatus(shopId, api),
    storeInfo: await getStoreInfo(shopId, api)
  };
}
```

### 4. Implement Smart Routing (2-3 hours)
- [ ] Create intent classification function
- [ ] Route questions to appropriate data gathering
- [ ] Optimize context inclusion based on intent

```typescript
const intents = {
  SALES: ['sales', 'revenue', 'orders'],
  FRAUD: ['fraud', 'risk', 'suspicious'],
  INVENTORY: ['inventory', 'stock', 'products'],
  CUSTOMER: ['customer', 'buyer', 'shopper']
};

function classifyIntent(question: string) {
  // Use keyword matching or simple NLP
  // Return primary intent and confidence
}
```

### 5. Add Response Formatting (2-3 hours)
- [ ] Structure AI responses with metadata
- [ ] Support different response types:
  - Text responses
  - Data tables
  - Chart suggestions
  - Action recommendations
- [ ] Include follow-up suggestions

```typescript
interface AIResponse {
  answer: string;
  confidence: number;
  dataType: 'text' | 'table' | 'chart' | 'alert';
  data?: any;
  followUpQuestions?: string[];
  suggestedActions?: Action[];
}
```

### 6. Implement Caching (2-3 hours)
- [ ] Add Redis caching for frequent queries
- [ ] Store conversation history per shop
- [ ] Implement rate limiting
- [ ] Cache invalidation strategy

```typescript
const cacheKey = `ai_response:${shopId}:${questionHash}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;

// Generate response
const response = await generateResponse(question, context);

// Cache for 1 hour
await redis.setex(cacheKey, 3600, response);
```

### 7. Error Handling & Fallbacks (1-2 hours)
- [ ] Handle OpenAI API failures
- [ ] Implement fallback responses
- [ ] Add comprehensive logging
- [ ] Monitor usage and errors

```typescript
try {
  const response = await openAI.complete(prompt);
  return response;
} catch (error) {
  logger.error('OpenAI API error', { error, question });
  
  // Fallback to pattern matching
  return getFallbackResponse(question);
}
```

### 8. Frontend Integration (2-3 hours)
- [ ] Update `_app._index.tsx` to call new AI action
- [ ] Add loading states
- [ ] Display rich responses
- [ ] Handle errors gracefully

```typescript
const handleAskAI = async (question: string) => {
  setLoading(true);
  
  try {
    const result = await api.askAI({ 
      question, 
      shopId,
      includeContext: true 
    });
    
    setAiResponse(result.response);
    setFollowUpQuestions(result.followUpQuestions);
  } catch (error) {
    setAiResponse('I encountered an error. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

## Cost Analysis
- **OpenAI API Costs**:
  - GPT-3.5-turbo: ~$0.01-0.03 per query
  - GPT-4: ~$0.03-0.10 per query
- **Monthly estimate** (1000 queries/day): $300-$900

## Performance Considerations
- **Response time**: 1-3 seconds per query
- **Caching**: Reduces response time to <100ms for repeated queries
- **Rate limiting**: Prevent abuse and control costs

## Security Considerations
- [ ] Sanitize user inputs
- [ ] Validate shop permissions
- [ ] Don't expose sensitive data in prompts
- [ ] Log all AI interactions for audit

## Testing Plan
1. Unit tests for intent classification
2. Integration tests for data gathering
3. E2E tests for various question types
4. Performance testing with concurrent requests
5. Cost monitoring and optimization

## Rollout Strategy
1. **Phase 1**: Deploy to development environment
2. **Phase 2**: Beta test with selected merchants
3. **Phase 3**: Gradual rollout with feature flag
4. **Phase 4**: Full production deployment

## Success Metrics
- Response accuracy: >90%
- Response time: <3 seconds
- User satisfaction: >4.5/5
- Cost per query: <$0.05
- Error rate: <1%

## Future Enhancements
- Fine-tune custom model on store data
- Multi-language support
- Voice input/output
- Proactive insights and alerts
- Integration with other LLMs (Claude, Gemini)