import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  ButtonGroup,
  BlockStack,
  InlineGrid,
  Box,
  Divider,
  InlineStack,
  Tabs,
  Badge,
  ProgressBar,
  Tag,
  Icon
} from '@shopify/polaris';
import {
  AnalyticsIcon,
  RefreshIcon,
  CustomersIcon,
  AutomationIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@shopify/polaris-icons';
import { useState, useCallback } from 'react';
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// Demo data for investor presentation
const DEMO_DATA = {
  withSOS: {
    conversionLift: '+47%',
    conversionRate: '4.3%',
    revenue: '$127,384',
    verifications: '1.2M',
    skipRate: '73%',
    decisions: '14,237',
    hoursSaved: '312',
    accuracy: '99.7%',
    savings: '$18,420'
  },
  withoutSOS: {
    conversionLift: '0%',
    conversionRate: '2.9%',
    revenue: '$0',
    verifications: '0',
    skipRate: '0%',
    decisions: '0',
    hoursSaved: '0',
    accuracy: 'N/A',
    savings: '$0'
  }
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  try {
    // For Gadget apps, use demo shop domain
    // TODO: Implement proper Gadget session handling
    const shopDomain = "fashion-boutique-demo.myshopify.com";
    
    return json({
      shopDomain
    });
  } catch (error) {
    console.error("Loader error:", error);
    return json({
      shopDomain: "fashion-boutique-demo.myshopify.com"
    });
  }
};

export default function InvestorDemo() {
  const { shopDomain } = useLoaderData<typeof loader>();
  const [selectedTab, setSelectedTab] = useState(0);
  const [showWithSOS, setShowWithSOS] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setSelectedTab(selectedTabIndex);
    setShowDetails(false);
  }, []);

  const data = showWithSOS ? DEMO_DATA.withSOS : DEMO_DATA.withoutSOS;

  const tabs = [
    {
      id: 'conversion',
      content: 'Conversion Impact',
      icon: AnalyticsIcon,
    },
    {
      id: 'network',
      content: 'Network Effect',
      icon: RefreshIcon,
    },
    {
      id: 'visitors',
      content: 'Visitor Intel',
      icon: CustomersIcon,
    },
    {
      id: 'ai',
      content: 'AI Automation',
      icon: AutomationIcon,
    },
  ];

  const renderConversionTab = () => (
    <BlockStack gap="400">
      {/* Hero Metric */}
      <Card>
        <Box padding="800" paddingBlockStart="1200" paddingBlockEnd="1200">
          <BlockStack gap="400" align="center">
            <Text variant="heading3xl" as="h1" alignment="center" tone="success">
              {data.conversionLift}
            </Text>
            <Text variant="headingLg" as="h2" alignment="center">
              Conversion Lift
            </Text>
            <Button 
              variant="plain" 
              onClick={() => setShowDetails(!showDetails)}
              ariaExpanded={showDetails}
            >
              <Text variant="bodySm" tone="subdued">
                {showDetails ? 'Hide details' : 'Tap for details'}
              </Text>
            </Button>
          </BlockStack>
        </Box>
      </Card>

      {/* Revenue Impact */}
      <Card>
        <Box padding="600">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="200">
              <Text variant="headingMd" tone="subdued">Additional Revenue This Month</Text>
              <Text variant="heading2xl" tone="success">{data.revenue}</Text>
            </BlockStack>
            <Box>
              <Icon source={AnalyticsMajor} tone="success" />
            </Box>
          </InlineStack>
        </Box>
      </Card>

      {/* Conversion Details (shown when tapped) */}
      {showDetails && (
        <Card>
          <Box padding="600">
            <BlockStack gap="400">
              <Text variant="headingMd">How We Achieve {data.conversionLift} Lift</Text>
              <Divider />
              
              <BlockStack gap="300">
                <Box>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd">🟢 Trusted Visitors (18%)</Text>
                    <Badge tone="success">55% conversion</Badge>
                  </InlineStack>
                  <Text variant="bodySm" tone="subdued">Previous: 28% → +92% improvement</Text>
                </Box>

                <Box>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd">🟡 New Visitors (72%)</Text>
                    <Badge>14% conversion</Badge>
                  </InlineStack>
                  <Text variant="bodySm" tone="subdued">Previous: 12% → +20% improvement</Text>
                </Box>

                <Box>
                  <InlineStack align="space-between">
                    <Text variant="bodyMd">🔴 Blocked Threats (10%)</Text>
                    <Badge tone="critical">0% conversion</Badge>
                  </InlineStack>
                  <Text variant="bodySm" tone="subdued">Previous: 2% fraud → -100% eliminated</Text>
                </Box>
              </BlockStack>

              <Divider />
              <Box>
                <Text variant="bodyMd" fontWeight="semibold">
                  Weighted Average: {data.conversionRate} total conversion
                </Text>
                <Text variant="bodySm" tone="subdued">
                  vs 2.9% baseline = {data.conversionLift} lift
                </Text>
              </Box>
            </BlockStack>
          </Box>
        </Card>
      )}

      {/* Performance Metrics */}
      <InlineGrid columns={2} gap="400">
        <Card>
          <Box padding="400">
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Good Actor Experience</Text>
              <Text variant="headingLg">98% Happy</Text>
              <ProgressBar progress={98} tone="success" size="small" />
            </BlockStack>
          </Box>
        </Card>
        <Card>
          <Box padding="400">
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Bad Actors Blocked</Text>
              <Text variant="headingLg">99.2% Stopped</Text>
              <ProgressBar progress={99.2} tone="critical" size="small" />
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>
    </BlockStack>
  );

  const renderNetworkTab = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="800" paddingBlockStart="1200" paddingBlockEnd="1200">
          <BlockStack gap="400" align="center">
            <Text variant="heading3xl" as="h1" alignment="center">
              {data.verifications}
            </Text>
            <Text variant="headingLg" as="h2" alignment="center">
              Verifications Recycled
            </Text>
            <Text variant="bodyMd" alignment="center" tone="subdued">
              Network Effect in Action
            </Text>
          </BlockStack>
        </Box>
      </Card>

      <Card>
        <Box padding="600">
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingMd">{data.skipRate} Skip Verification</Text>
              <Badge tone="success">Network Benefit</Badge>
            </InlineStack>
            <ProgressBar progress={73} tone="success" />
            <Text variant="bodySm" tone="subdued">
              When one store verifies a customer, every store benefits
            </Text>
          </BlockStack>
        </Box>
      </Card>

      <Card>
        <Box padding="600">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="200">
              <Text variant="headingMd" tone="subdued">Average Time Saved</Text>
              <Text variant="heading2xl">2.3 Seconds</Text>
            </BlockStack>
            <Box>
              <Icon source={RefreshMajor} tone="success" />
            </Box>
          </InlineStack>
        </Box>
      </Card>
    </BlockStack>
  );

  const renderVisitorTab = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="600">
          <BlockStack gap="400">
            <Text variant="headingLg">Visitor Segmentation</Text>
            <Divider />
            
            <BlockStack gap="300">
              <Box>
                <InlineStack align="space-between">
                  <Text variant="headingMd">VIP/Trusted</Text>
                  <Tag>18% of traffic</Tag>
                </InlineStack>
                <Text variant="bodySm" tone="subdued">55% conversion rate</Text>
                <Box paddingBlockStart="200">
                  <ProgressBar progress={18} tone="success" size="small" />
                </Box>
              </Box>

              <Box>
                <InlineStack align="space-between">
                  <Text variant="headingMd">New Visitors</Text>
                  <Tag>72% of traffic</Tag>
                </InlineStack>
                <Text variant="bodySm" tone="subdued">14% conversion rate</Text>
                <Box paddingBlockStart="200">
                  <ProgressBar progress={72} size="small" />
                </Box>
              </Box>

              <Box>
                <InlineStack align="space-between">
                  <Text variant="headingMd">Blocked/Bots</Text>
                  <Tag tone="critical">10% of traffic</Tag>
                </InlineStack>
                <Text variant="bodySm" tone="subdued">0% conversion rate</Text>
                <Box paddingBlockStart="200">
                  <ProgressBar progress={10} tone="critical" size="small" />
                </Box>
              </Box>
            </BlockStack>
          </BlockStack>
        </Box>
      </Card>

      <Card>
        <Box padding="600">
          <BlockStack gap="300">
            <Text variant="headingMd">Smart Friction Management</Text>
            <Text variant="bodyMd">
              ✅ VIP Lane: Express checkout
            </Text>
            <Text variant="bodyMd">
              🔍 Standard Lane: Light verification
            </Text>
            <Text variant="bodyMd">
              🛑 Security Lane: Maximum protection
            </Text>
          </BlockStack>
        </Box>
      </Card>
    </BlockStack>
  );

  const renderAITab = () => (
    <BlockStack gap="400">
      <Card>
        <Box padding="800" paddingBlockStart="1200" paddingBlockEnd="1200">
          <BlockStack gap="400" align="center">
            <Text variant="heading3xl" as="h1" alignment="center">
              {data.decisions}
            </Text>
            <Text variant="headingLg" as="h2" alignment="center">
              Decisions Today
            </Text>
            <Text variant="bodyMd" alignment="center" tone="subdued">
              Fully Automated Protection
            </Text>
          </BlockStack>
        </Box>
      </Card>

      <InlineGrid columns={2} gap="400">
        <Card>
          <Box padding="400">
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Hours Saved</Text>
              <Text variant="headingLg">{data.hoursSaved}</Text>
              <Text variant="bodySm">This Month</Text>
            </BlockStack>
          </Box>
        </Card>
        <Card>
          <Box padding="400">
            <BlockStack gap="200">
              <Text variant="bodySm" tone="subdued">Accuracy</Text>
              <Text variant="headingLg">{data.accuracy}</Text>
              <Text variant="bodySm">AI Performance</Text>
            </BlockStack>
          </Box>
        </Card>
      </InlineGrid>

      <Card>
        <Box padding="600">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="200">
              <Text variant="headingMd" tone="subdued">Cost Savings</Text>
              <Text variant="heading2xl" tone="success">{data.savings}/month</Text>
              <Text variant="bodySm">vs Manual Review</Text>
            </BlockStack>
            <Box>
              <Icon source={AutomationMajor} tone="success" />
            </Box>
          </InlineStack>
        </Box>
      </Card>
    </BlockStack>
  );

  const tabContent = [
    renderConversionTab(),
    renderNetworkTab(),
    renderVisitorTab(),
    renderAITab()
  ];

  return (
    <Page title="Fashion Boutique Demo">
      <Layout>
        <Layout.Section>
          <Card>
            <Box padding="400">
              <InlineStack align="space-between" blockAlign="center">
                <Badge tone="info">Demo Mode</Badge>
                <ButtonGroup variant="segmented">
                  <Button 
                    pressed={showWithSOS} 
                    onClick={() => setShowWithSOS(true)}
                  >
                    With SOS
                  </Button>
                  <Button 
                    pressed={!showWithSOS} 
                    onClick={() => setShowWithSOS(false)}
                  >
                    Without
                  </Button>
                </ButtonGroup>
              </InlineStack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
              <Box padding="400">
                {tabContent[selectedTab]}
              </Box>
            </Tabs>
          </Card>
        </Layout.Section>

        {/* Swipe hint for mobile */}
        <Layout.Section>
          <Box padding="400">
            <InlineStack align="center" gap="200">
              <Icon source={ChevronLeftIcon} tone="subdued" />
              <Text variant="bodySm" tone="subdued" alignment="center">
                Swipe between tabs
              </Text>
              <Icon source={ChevronRightIcon} tone="subdued" />
            </InlineStack>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}