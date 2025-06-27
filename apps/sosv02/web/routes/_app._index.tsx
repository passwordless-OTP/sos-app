import { 
  Page, 
  Layout, 
  Card,
  Text, 
  Button, 
  TextField,
  Banner,
  Badge,
  DataTable,
  BlockStack,
  InlineGrid,
  Box,
  Divider,
  Icon,
  InlineStack,
  SkeletonBodyText,
  SkeletonDisplayText,
  ButtonGroup,
  Tag,
  ProgressBar,
  ActionList,
  Popover,
  Spinner
} from '@shopify/polaris';
import {
  CashDollarIcon,
  OrderIcon,
  AlertCircleIcon,
  TeamIcon,
  SearchIcon
} from '@shopify/polaris-icons';
import { useState, useCallback, useEffect } from 'react';
import { useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { api } from '../api';

// Speech Recognition API type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
  readonly prototype: SpeechRecognition;
}

// Extend Window interface to include Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
    shopify?: {
      toast?: {
        show: (message: string) => void;
      };
    };
  }
}


export const loader = async ({ context }: LoaderFunctionArgs) => {
  // In Gadget, shop data comes from context.gadgetConfig
  const shopDomain = context.gadgetConfig?.shopId || "dev-sandbox-vk.myshopify.com";
  
  return json({
    shopId: "demo-shop-id",
    shopDomain: shopDomain
  });
};

// Chart data interface
interface ChartDataItem {
  label: string;
  value: number;
}

// Chart component props interface
interface SimpleLineChartProps {
  data: ChartDataItem[];
  title: string;
}

// Simple line chart component
function SimpleLineChart({ data, title }: SimpleLineChartProps) {
  const maxValue = Math.max(...data.map((d: ChartDataItem) => d.value));
  const chartHeight = 120;
  
  return (
    <Box>
      <Text variant="headingSm" as="h3">{title}</Text>
      <Box paddingBlockStart="200">
        <svg width="100%" height={chartHeight} viewBox={`0 0 300 ${chartHeight}`}>
          <polyline
            fill="none"
            stroke="#008060"
            strokeWidth="2"
            points={data.map((d: ChartDataItem, i) => 
              `${i * (300 / (data.length - 1))},${chartHeight - (d.value / maxValue) * (chartHeight - 20)}`
            ).join(' ')}
          />
          {data.map((d: ChartDataItem, i) => (
            <circle
              key={i}
              cx={i * (300 / (data.length - 1))}
              cy={chartHeight - (d.value / maxValue) * (chartHeight - 20)}
              r="3"
              fill="#008060"
            />
          ))}
        </svg>
        <InlineStack gap="400" align="space-between">
          <Text variant="bodySm" tone="subdued">{data[0].label}</Text>
          <Text variant="bodySm" tone="subdued">{data[data.length - 1].label}</Text>
        </InlineStack>
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  console.log('[SOS Dashboard] Component mounting...');
  // For demo purposes
  const { shopId, shopDomain } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState(75);
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Network effect demo states
  const [networkAlerts, setNetworkAlerts] = useState([]);
  const [showNetworkEffect, setShowNetworkEffect] = useState(false);
  const [liveNetworkActivity, setLiveNetworkActivity] = useState([]);
  
  // ROI Calculator states
  const [monthlyRevenue, setMonthlyRevenue] = useState('50000');
  const [roiCalculated, setRoiCalculated] = useState(false);

  // Demo data
  const salesData = "$12,450";
  const ordersToday = "23";
  const riskScore = "Low";
  const networkSize = "17,453";
  
  // Sales chart data
  const salesChartData = [
    { label: 'Mon', value: 3200 },
    { label: 'Tue', value: 2800 },
    { label: 'Wed', value: 3500 },
    { label: 'Thu', value: 2900 },
    { label: 'Fri', value: 3245 },
    { label: 'Sat', value: 4100 },
    { label: 'Today', value: 3800 },
  ];
  
  // Initialize client-side state with robust hydration detection
  useEffect(() => {
    setIsMounted(true);
    setIsClient(true);
    
    // Use a timeout to ensure proper hydration
    const hydrationTimeout = setTimeout(() => {
      setIsHydrated(true);
      setNotificationCount(3);
    }, 100);

    return () => clearTimeout(hydrationTimeout);
  }, []);

  // Suggested questions
  const suggestedQuestions = [
    "What were my sales today?",
    "Show me high-risk orders",
    "What's my best selling product?",
    "Any fraud attempts today?",
    "Inventory running low?"
  ];
  
  const handleQueryChange = useCallback((value) => setQuery(value), []);
  const showToast = useCallback((message) => {
    if (typeof window !== 'undefined' && isClient && window.shopify?.toast) {
      window.shopify.toast.show(message);
    }
  }, [isClient]);
  const toggleNotifications = useCallback(() => setNotificationsOpen((open) => !open), []);
  
  const handleQuestionClick = useCallback((question) => {
    setQuery(question);
    handleAskAI(question);
  }, []);
  
  const handleVoiceInput = useCallback(() => {
    if (!isHydrated || !isMounted) return;
    
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass() as SpeechRecognition;
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      
      recognition.onstart = () => setVoiceListening(true);
      recognition.onend = () => setVoiceListening(false);
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleAskAI(transcript);
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setVoiceListening(false);
        showToast(`Voice input error: ${event.error}`);
      };
      
      recognition.start();
    } else {
      showToast('Voice input is not supported in this browser');
    }
  }, [showToast, isHydrated, isMounted, query]);
  
  const handleAskAI = async (questionText = null) => {
    console.log('[SOS Dashboard] handleAskAI called with:', questionText || query);
    const textToProcess = questionText || query;
    if (!textToProcess) return;
    
    setLoading(true);
    
    try {
      console.log('[SOS Dashboard] Processing question:', textToProcess);
      console.log('[SOS Dashboard] Contains "today"?', textToProcess.toLowerCase().includes('today'));
      console.log('[SOS Dashboard] Contains "sales"?', textToProcess.toLowerCase().includes('sales'));
      
      // Check if asking about today's sales
      if (textToProcess.toLowerCase().includes('today') && textToProcess.toLowerCase().includes('sales')) {
        console.log('[SOS Dashboard] Shop ID:', shopId);
        
        try {
          // Use a default shop ID if none available
          const shopIdToUse = shopId || "1";
          console.log('[SOS Dashboard] Calling API with shopId:', shopIdToUse);
          
          const result = await api.getTodaysSales({ shopId: shopIdToUse });
          console.log('[SOS Dashboard] API response:', result);
          
          if (result.success && result.data) {
            const { totalSales, orderCount, currencyCode, topProducts } = result.data;
            const topProductText = topProducts && topProducts.length > 0 
              ? `Your best-selling product was "${topProducts[0].title}" with ${topProducts[0].quantity} units sold.`
              : '';
            setAiResponse(`Based on real-time data: You had ${orderCount} orders today totaling ${currencyCode} $${totalSales}. ${topProductText}`);
          }
        } catch (error) {
          console.error('[SOS Dashboard] API error:', error);
          setAiResponse(`Error fetching sales data: ${error.message}. Please try again.`);
        }
        
        setLoading(false);
        showToast('Sales data retrieved successfully');
        setNotificationCount(prev => prev + 1);
        return; // Prevent other conditions from overwriting
      } else if (textToProcess.toLowerCase().includes('sales')) {
        // Fallback for other sales questions
        setAiResponse('Your sales yesterday were $3,245 with 12 orders. This is 15% higher than your daily average.');
        return;
      } else if (textToProcess.toLowerCase().includes('fraud')) {
        setAiResponse('No fraudulent activity detected in the last 24 hours. All orders passed security checks. 2 orders flagged for manual review.');
        return;
      } else if (textToProcess.toLowerCase().includes('inventory')) {
        setAiResponse('Current inventory levels are healthy. Top product "Blue Widget" has 156 units. "Red Gadget" is running low with only 23 units remaining.');
        return;
      } else if (textToProcess.toLowerCase().includes('best selling')) {
        setAiResponse('Your best selling product this week is "Premium Blue Widget" with 89 units sold, generating $2,670 in revenue.');
        return;
      } else {
        setAiResponse('I can help you with sales data, fraud detection, inventory, and order analytics. Try asking "What were my sales today?" to see real-time data.');
      }
    } catch (error) {
      console.error('[SOS Dashboard] Error in AI handler:', error);
      setAiResponse('I encountered an error processing your request. Please try again.');
    }
    
    setLoading(false);
    showToast('AI response generated');
    
    // Simulate new notification
    setNotificationCount(prev => prev + 1);
  };
  
  // Network effect demo function
  const simulateNetworkEffect = useCallback(() => {
    if (!isHydrated || !isMounted) return;
    
    // Play alert sound
    const alertSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCuBzvLY');
    alertSound.volume = 0.3;
    alertSound.play().catch(() => {}); // Ignore if audio blocked
    
    // Simulate fraud detection on Store A
    const newAlert = {
      id: Date.now(),
      store: 'TechGadgets Pro',
      threat: 'Suspicious card: 4532****8976',
      location: 'Miami, FL',
      time: 'Just now',
      riskLevel: 'High'
    };
    
    setNetworkAlerts(prev => [newAlert, ...prev]);
    setNotificationCount(prev => prev + 1);
    
    // Simulate network propagation after 2 seconds
    setTimeout(() => {
      // Play success sound
      const successSound = new Audio('data:audio/wav;base64,UklGRl4GAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToGAACBhYmEbF5fdJyxrIVhNzVgqNvcoWEbBkCY3OTLeSsFLYLA79mTQgkZaLvw56RQEgxPqOXrt2wiBDuS0+zTgjMGHnjB7tueUgoWZbXr6KFSFQ');
      successSound.volume = 0.3;
      successSound.play().catch(() => {});
      
      const networkActivity = [
        { store: 'Fashion Boutique NYC', action: 'Blocked same card', time: '2 sec ago' },
        { store: 'Sports Gear Express', action: 'Flagged for review', time: '3 sec ago' },
        { store: 'Beauty Haven Store', action: 'Auto-declined order', time: '5 sec ago' }
      ];
      setLiveNetworkActivity(networkActivity);
      showToast('Network protected 3 stores from fraud!');
    }, 2000);
  }, [isHydrated, isMounted, showToast]);

  const handleExport = useCallback(() => {
    if (!isHydrated || !isMounted || typeof window === 'undefined') return;
    
    // Simulate export
    const data = {
      sales: salesData,
      orders: ordersToday,
      riskLevel: riskScore,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sos-dashboard-export-${Date.now()}.json`;
    a.click();
    
    showToast('Dashboard data exported successfully');
  }, [salesData, ordersToday, riskScore, showToast, isHydrated, isMounted]);

  // Loading skeleton components
  const LoadingSkeleton = () => (
    <Box padding="400">
      <BlockStack gap="300">
        <SkeletonDisplayText size="small" />
        <SkeletonBodyText lines={3} />
      </BlockStack>
    </Box>
  );

  const MetricsLoadingSkeleton = () => (
    <InlineGrid columns={{xs: 1, sm: 2, md: 4}} gap="400">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <Box padding="400">
            <BlockStack gap="200">
              <SkeletonDisplayText size="small" />
              <SkeletonDisplayText size="large" />
              <SkeletonBodyText lines={1} />
            </BlockStack>
          </Box>
        </Card>
      ))}
    </InlineGrid>
  );

  // Client-side component for fraud check table
  const FraudCheckTable = () => {
    if (!isHydrated || !isMounted) {
      return (
        <Box>
          <BlockStack gap="300">
            <SkeletonDisplayText size="small" />
            <SkeletonBodyText lines={5} />
          </BlockStack>
        </Box>
      );
    }

    const fraudCheckRows = [
      ['#1234', 'john@example.com', '192.168.1.1', <Badge tone="success">Safe</Badge>, '95'],
      ['#1235', 'suspicious@temp.com', '45.67.89.10', <Badge tone="warning">Review</Badge>, '45'],
      ['#1236', 'mary@gmail.com', '98.76.54.32', <Badge tone="success">Safe</Badge>, '92'],
      ['#1237', 'test@protonmail.com', '178.45.22.11', <Badge tone="critical">High Risk</Badge>, '15'],
      ['#1238', 'customer@outlook.com', '92.168.1.45', <Badge tone="success">Safe</Badge>, '88'],
    ];

    return (
      <Box>
        <DataTable
          columnContentTypes={[
            'text',
            'text',
            'text',
            'text',
            'numeric',
          ]}
          headings={[
            'Order',
            'Email',
            'IP Address',
            'Status',
            'Risk Score',
          ]}
          rows={fraudCheckRows}
          hoverable
          truncate
          verticalAlign="middle"
          increasedTableDensity
        />
      </Box>
    );
  };
  
  const notificationItems = [
    { content: 'New high-risk order detected', icon: AlertCircleIcon },
    { content: 'Daily report ready', icon: CashDollarIcon },
    { content: 'Network alert: Suspicious IP flagged', icon: TeamIcon },
  ];

  
  const notificationMarkup = isHydrated && isMounted ? (
    <Popover
      active={notificationsOpen}
      activator={
        <Button
          onClick={toggleNotifications}
          variant="plain"
          icon={AlertCircleIcon}
          accessibilityLabel="Notifications"
        >
          {notificationCount > 0 && (
            <Badge tone="critical">{notificationCount}</Badge>
          )}
        </Button>
      }
      onClose={toggleNotifications}
    >
      <ActionList
        actionRole="menuitem"
        items={notificationItems}
      />
    </Popover>
  ) : (
    <Button
      variant="plain"
      icon={AlertCircleIcon}
      accessibilityLabel="Notifications"
      disabled
    />
  );

  // Show loading state if not mounted or hydrated
  if (!isMounted || !isHydrated) {
    return (
      <Page
        title="SOS Dashboard"
        subtitle="Loading..."
      >
        <BlockStack gap="500">
          {/* Notification Button in Header Area */}
          {isHydrated && isMounted && (
            <Card>
              <Box padding="400">
                <InlineStack align="end">
                  {notificationMarkup}
                </InlineStack>
              </Box>
            </Card>
          )}
          <Box padding="400" background="bg-surface-secondary">
            <InlineStack align="center" blockAlign="center">
              <Spinner accessibilityLabel="Loading dashboard" size="small" />
              <Text variant="bodyMd" tone="subdued">Loading dashboard...</Text>
            </InlineStack>
          </Box>
          
          <MetricsLoadingSkeleton />
          
          <Card>
            <LoadingSkeleton />
          </Card>
          
          <Card>
            <LoadingSkeleton />
          </Card>
          
          <Card>
            <LoadingSkeleton />
          </Card>
        </BlockStack>
      </Page>
    );
  }

  return (
    <Page
        title="SOS Dashboard"
        subtitle="AI-Powered Store Intelligence & Fraud Prevention"
        primaryAction={{
          content: 'View Settings',
          accessibilityLabel: 'View app settings',
        }}
        secondaryActions={[
          ...(isHydrated && isMounted ? [{
            content: 'Export',
            onAction: handleExport,
            accessibilityLabel: 'Export dashboard data',
          }] : []),
        ]}
        actionGroups={[
          {
            title: 'Notifications',
            actions: [],
          },
        ]}
      >
        <BlockStack gap="500">
          {/* Onboarding Progress */}
          {onboardingProgress < 100 && (
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text variant="headingSm" as="h3">Setup Progress</Text>
                    <Text variant="bodySm" tone="subdued">{onboardingProgress}% Complete</Text>
                  </InlineStack>
                  <ProgressBar progress={onboardingProgress} tone="primary" />
                  <Text variant="bodySm" tone="subdued">
                    Complete your store setup to unlock all features
                  </Text>
                </BlockStack>
              </Box>
            </Card>
          )}
          
          {/* Welcome Banner */}
          <Banner
            title="Welcome to SOS - Store Operations Shield"
            tone="info"
            onDismiss={() => {}}
          >
            <p>Ask me anything about your store or check orders for fraud. Connected to {networkSize} stores for real-time threat intelligence.</p>
          </Banner>

          {/* Metrics Grid with Chart */}
          <InlineGrid columns={{xs: 1, sm: 2, md: 4}} gap="400">
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={CashDollarIcon} tone="success" />
                    <Text variant="headingMd" as="h3">Today's Sales</Text>
                  </InlineStack>
                  <Text variant="heading2xl" as="p" fontWeight="bold">{salesData}</Text>
                  <Text variant="bodySm" as="p" tone="subdued">+15% from yesterday</Text>
                </BlockStack>
              </Box>
            </Card>
            
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={OrderIcon} tone="base" />
                    <Text variant="headingMd" as="h3">Orders Today</Text>
                  </InlineStack>
                  <Text variant="heading2xl" as="p" fontWeight="bold">{ordersToday}</Text>
                  <Text variant="bodySm" as="p" tone="subdued">3 pending review</Text>
                </BlockStack>
              </Box>
            </Card>
            
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={AlertCircleIcon} tone="success" />
                    <Text variant="headingMd" as="h3">Network Risk</Text>
                  </InlineStack>
                  <Text variant="heading2xl" as="p" fontWeight="bold">{riskScore}</Text>
                  <Text variant="bodySm" as="p" tone="subdued">Community protected</Text>
                </BlockStack>
              </Box>
            </Card>
            
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={TeamIcon} tone="magic" />
                    <Text variant="headingMd" as="h3">Network Size</Text>
                  </InlineStack>
                  <Text variant="heading2xl" as="p" fontWeight="bold">{networkSize}</Text>
                  <Text variant="bodySm" as="p" tone="subdued">Protected stores</Text>
                </BlockStack>
              </Box>
            </Card>
          </InlineGrid>

          {/* Sales Trend Chart */}
          <Layout>
            <Layout.Section>
              <Card>
                <Box padding="400">
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon source={CashDollarIcon} tone="base" />
                        <Text variant="headingMd" as="h3">Sales Trend</Text>
                      </InlineStack>
                      <Badge tone="success">+15%</Badge>
                    </InlineStack>
                    <SimpleLineChart data={salesChartData} title="Last 7 Days" />
                  </BlockStack>
                </Box>
              </Card>
            </Layout.Section>
          </Layout>

          {/* AI Assistant Section Enhanced */}
          <Layout>
            <Layout.Section>
              <Card>
                <Box padding="600">
                  <BlockStack gap="400">
                    <InlineStack gap="200" blockAlign="center" align="space-between">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon source={SearchIcon} tone="interactive" />
                        <Text variant="headingLg" as="h2">AI Store Assistant</Text>
                      </InlineStack>
                      <Badge tone="info">Beta</Badge>
                    </InlineStack>
                    
                    {/* Suggested Questions */}
                    <Box>
                      <Text variant="bodySm" tone="subdued">Quick questions:</Text>
                      <Box paddingBlockStart="200">
                        <InlineStack gap="200" wrap>
                          {suggestedQuestions.map((question, i) => (
                            <Tag 
                              key={i} 
                              onClick={isHydrated && isMounted ? () => handleQuestionClick(question) : undefined}
                              disabled={!isHydrated || !isMounted}
                            >
                              {question}
                            </Tag>
                          ))}
                        </InlineStack>
                      </Box>
                    </Box>
                    
                    <TextField
                      label="Ask anything about your store"
                      labelHidden={false}
                      value={query}
                      onChange={handleQueryChange}
                      placeholder="e.g., What were my sales yesterday? Show me high-risk orders. What's my best selling product?"
                      autoComplete="off"
                      helpText="Try questions about sales, orders, inventory, customers, or fraud detection"
                      connectedRight={
                        <ButtonGroup>
                          {isHydrated && isMounted && (
                            <Button
                              icon={SearchIcon}
                              onClick={handleVoiceInput}
                              accessibilityLabel="Voice input"
                              loading={voiceListening}
                              variant="plain"
                            />
                          )}
                          <Button
                            variant="primary"
                            onClick={isHydrated && isMounted ? () => handleAskAI() : undefined}
                            loading={loading}
                            disabled={!query || loading || !isHydrated || !isMounted}
                            accessibilityLabel="Submit question to AI assistant"
                          >
                            Ask AI
                          </Button>
                        </ButtonGroup>
                      }
                    />
                    
                    {aiResponse && (
                      <>
                        <Divider />
                        <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                          <BlockStack gap="200">
                            <InlineStack align="space-between">
                              <Text variant="headingSm" as="h3">AI Response</Text>
                              <Badge tone="success">High confidence</Badge>
                            </InlineStack>
                            <Text variant="bodyMd" as="p">{aiResponse}</Text>
                          </BlockStack>
                        </Box>
                      </>
                    )}
                    
                    {loading && (
                      <Box padding="400">
                        <BlockStack gap="300">
                          <SkeletonDisplayText size="small" />
                          <SkeletonBodyText lines={2} />
                        </BlockStack>
                      </Box>
                    )}
                  </BlockStack>
                </Box>
              </Card>
            </Layout.Section>
          </Layout>

          {/* Customer Risk Intelligence Section */}
          <Card>
            <Box padding="600">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={TeamIcon} tone="critical" />
                    <Text variant="headingLg" as="h2">Customer Risk Intelligence</Text>
                  </InlineStack>
                  <Badge tone="info">Network Powered</Badge>
                </InlineStack>
                
                {/* Customer Health Overview */}
                <Box background="bg-surface-secondary" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <Text variant="headingSm">Your Customer Health Score</Text>
                      <Text variant="headingLg" fontWeight="bold" tone="success">94%</Text>
                    </InlineStack>
                    
                    <ProgressBar progress={94} tone="success" />
                    
                    <InlineGrid columns={3} gap="200">
                      <Box>
                        <Text variant="bodySm" tone="subdued">Clean Customers</Text>
                        <Text variant="headingMd" fontWeight="semibold" tone="success">9,412</Text>
                      </Box>
                      <Box>
                        <Text variant="bodySm" tone="subdued">Unknown/New</Text>
                        <Text variant="headingMd" fontWeight="semibold" tone="warning">483</Text>
                      </Box>
                      <Box>
                        <Text variant="bodySm" tone="subdued">Flagged by Network</Text>
                        <Text variant="headingMd" fontWeight="semibold" tone="critical">105</Text>
                      </Box>
                    </InlineGrid>
                  </BlockStack>
                </Box>
                
                {/* High Risk Customers Table */}
                <BlockStack gap="300">
                  <Text variant="headingSm">High Risk Customers (Network Intelligence)</Text>
                  <DataTable
                    columnContentTypes={[
                      'text',
                      'text',
                      'numeric',
                      'text',
                      'text',
                    ]}
                    headings={[
                      'Customer',
                      'Risk Level',
                      'Network Flags',
                      'Last Order',
                      'Action',
                    ]}
                    rows={[
                      [
                        'john.smith@email.com',
                        <Badge tone="critical">High</Badge>,
                        '7 stores',
                        '2 days ago',
                        <Button size="slim" tone="critical">Block</Button>,
                      ],
                      [
                        'sarah.wilson@email.com',
                        <Badge tone="warning">Medium</Badge>,
                        '3 stores',
                        '1 week ago',
                        <Button size="slim">Review</Button>,
                      ],
                      [
                        'mike.brown@email.com',
                        <Badge tone="warning">Medium</Badge>,
                        '2 stores',
                        '3 days ago',
                        <Button size="slim">Review</Button>,
                      ],
                    ]}
                  />
                </BlockStack>
              </BlockStack>
            </Box>
          </Card>

          {/* Network Effect Demo Section */}
          <Card>
            <Box padding="600">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Icon source={TeamIcon} tone="interactive" />
                    <Text variant="headingLg" as="h2">Network Intelligence Live Feed</Text>
                  </InlineStack>
                  <Button 
                    variant="primary"
                    onClick={simulateNetworkEffect}
                    disabled={!isHydrated || !isMounted}
                  >
                    Simulate Network Alert
                  </Button>
                </InlineStack>
                
                {/* Network Economics Dashboard */}
                <Box background="bg-surface-subdued" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center" align="space-between">
                      <Text variant="headingSm" as="h3">Network Trust Economy</Text>
                      <Badge tone="success">LIVE</Badge>
                    </InlineStack>
                    
                    {/* Network Metrics */}
                    <Box background="bg-surface" padding="300" borderRadius="100">
                      <InlineGrid columns={4} gap="300">
                        <BlockStack gap="100">
                          <Text variant="bodySm" tone="subdued">Active Stores</Text>
                          <Text variant="headingMd" fontWeight="semibold">{networkSize.toLocaleString()}</Text>
                          <Text variant="bodySm" tone="success">↑ 127 today</Text>
                        </BlockStack>
                        <BlockStack gap="100">
                          <Text variant="bodySm" tone="subdued">Signals/sec</Text>
                          <Text variant="headingMd" fontWeight="semibold">3,247</Text>
                          <Text variant="bodySm" tone="subdued">Real-time</Text>
                        </BlockStack>
                        <BlockStack gap="100">
                          <Text variant="bodySm" tone="subdued">Trust Actions</Text>
                          <Text variant="headingMd" fontWeight="semibold">48.2K</Text>
                          <Text variant="bodySm" tone="success">Today</Text>
                        </BlockStack>
                        <BlockStack gap="100">
                          <Text variant="bodySm" tone="subdued">Value Protected</Text>
                          <Text variant="headingMd" fontWeight="semibold">$1.3M</Text>
                          <Text variant="bodySm" tone="success">This week</Text>
                        </BlockStack>
                      </InlineGrid>
                    </Box>
                    
                    {/* Real-time Activity Feed */}
                    <Box background="bg-surface" padding="300" borderRadius="100">
                      <BlockStack gap="200">
                        <Text variant="headingSm">Live Network Activity</Text>
                        <BlockStack gap="100">
                          <InlineStack gap="200" wrap={false}>
                            <Badge tone="critical">BLOCK</Badge>
                            <Text variant="bodySm">Miami store blocked IP 192.168.x.x • Saved $2,340</Text>
                            <Text variant="bodySm" tone="subdued">2s ago</Text>
                          </InlineStack>
                          <InlineStack gap="200" wrap={false}>
                            <Badge tone="success">TRUST</Badge>
                            <Text variant="bodySm">LA store whitelisted customer@email.com • 47 stores benefit</Text>
                            <Text variant="bodySm" tone="subdued">5s ago</Text>
                          </InlineStack>
                          <InlineStack gap="200" wrap={false}>
                            <Badge tone="warning">FLAG</Badge>
                            <Text variant="bodySm">NYC store flagged suspicious pattern • Network alerted</Text>
                            <Text variant="bodySm" tone="subdued">8s ago</Text>
                          </InlineStack>
                          <InlineStack gap="200" wrap={false}>
                            <Badge tone="info">PROBE</Badge>
                            <Text variant="bodySm">Chicago store queried customer risk • Network responded in 43ms</Text>
                            <Text variant="bodySm" tone="subdued">12s ago</Text>
                          </InlineStack>
                        </BlockStack>
                      </BlockStack>
                    </Box>
                  </BlockStack>
                </Box>
                
                {/* MAIN CONCEPT: Active Store Network Communication */}
                <Box background="bg-surface-subdued" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center" align="space-between">
                      <Text variant="headingSm" as="h3">SOS Network Intelligence Exchange</Text>
                      <Badge tone="success">LIVE</Badge>
                    </InlineStack>
                    
                    {/* Active Network Visualization */}
                    <Box>
                      <svg width="100%" height="350" viewBox="0 0 800 350" style={{ background: '#0a0f1b', borderRadius: '8px' }}>
                        <defs>
                          {/* Gradient for network core */}
                          <radialGradient id="networkCore">
                            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8"/>
                            <stop offset="100%" stopColor="#00ff88" stopOpacity="0.1"/>
                          </radialGradient>
                          
                          {/* Animation for data packets */}
                          <circle id="dataPacket" r="3" fill="#00ff88">
                            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
                          </circle>
                          
                          <circle id="probePacket" r="4" fill="#00aaff">
                            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
                          </circle>
                          
                          <circle id="alertPacket" r="4" fill="#ff4444">
                            <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"/>
                          </circle>
                        </defs>
                        
                        {/* Central Network Core */}
                        <circle cx="400" cy="175" r="60" fill="url(#networkCore)"/>
                        <circle cx="400" cy="175" r="40" fill="none" stroke="#00ff88" strokeWidth="2" opacity="0.8">
                          <animate attributeName="r" values="40;50;40" dur="3s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        
                        {/* SOS Logo in center */}
                        <text x="400" y="180" fill="white" fontSize="24" textAnchor="middle" fontWeight="bold">SOS</text>
                        <text x="400" y="195" fill="#00ff88" fontSize="10" textAnchor="middle">NETWORK</text>
                        
                        {/* Store Nodes */}
                        {/* Top stores */}
                        <g id="store1">
                          <circle cx="400" cy="50" r="20" fill="#1a2332" stroke="#00aaff" strokeWidth="2"/>
                          <text x="400" y="55" fill="white" fontSize="10" textAnchor="middle">STORE</text>
                          <line x1="400" y1="70" x2="400" y2="115" stroke="#00aaff" strokeWidth="1" opacity="0.3"/>
                        </g>
                        
                        <g id="store2">
                          <circle cx="250" cy="100" r="20" fill="#1a2332" stroke="#00ff88" strokeWidth="2"/>
                          <text x="250" y="105" fill="white" fontSize="10" textAnchor="middle">STORE</text>
                          <line x1="270" y1="100" x2="340" y2="135" stroke="#00ff88" strokeWidth="1" opacity="0.3"/>
                        </g>
                        
                        <g id="store3">
                          <circle cx="550" cy="100" r="20" fill="#1a2332" stroke="#00ff88" strokeWidth="2"/>
                          <text x="550" y="105" fill="white" fontSize="10" textAnchor="middle">STORE</text>
                          <line x1="530" y1="100" x2="460" y2="135" stroke="#00ff88" strokeWidth="1" opacity="0.3"/>
                        </g>
                        
                        {/* Bottom stores */}
                        <g id="store4">
                          <circle cx="250" cy="250" r="20" fill="#1a2332" stroke="#ffaa00" strokeWidth="2"/>
                          <text x="250" y="255" fill="white" fontSize="10" textAnchor="middle">STORE</text>
                          <line x1="270" y1="250" x2="340" y2="215" stroke="#ffaa00" strokeWidth="1" opacity="0.3"/>
                        </g>
                        
                        <g id="store5">
                          <circle cx="400" cy="300" r="20" fill="#1a2332" stroke="#ff4444" strokeWidth="2"/>
                          <text x="400" y="305" fill="white" fontSize="10" textAnchor="middle">STORE</text>
                          <line x1="400" y1="280" x2="400" y2="235" stroke="#ff4444" strokeWidth="1" opacity="0.3"/>
                        </g>
                        
                        <g id="store6">
                          <circle cx="550" cy="250" r="20" fill="#1a2332" stroke="#00ff88" strokeWidth="2"/>
                          <text x="550" y="255" fill="white" fontSize="10" textAnchor="middle">STORE</text>
                          <line x1="530" y1="250" x2="460" y2="215" stroke="#00ff88" strokeWidth="1" opacity="0.3"/>
                        </g>
                        
                        {/* Animated data flows */}
                        {/* Store 1 sending probe */}
                        <circle r="4" fill="#00aaff">
                          <animateMotion dur="2s" repeatCount="indefinite">
                            <mpath href="#probe-path-1"/>
                          </animateMotion>
                          <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <path id="probe-path-1" d="M 400,70 Q 400,120 400,115" fill="none"/>
                        
                        {/* Store 2 sending login event */}
                        <circle r="3" fill="#00ff88">
                          <animateMotion dur="1.5s" repeatCount="indefinite">
                            <mpath href="#event-path-2"/>
                          </animateMotion>
                          <animate attributeName="opacity" values="0;1;1;0" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                        <path id="event-path-2" d="M 270,100 L 340,135" fill="none"/>
                        
                        {/* Store 5 sending fraud alert */}
                        {networkAlerts.length > 0 && (
                          <>
                            <circle r="5" fill="#ff4444">
                              <animateMotion dur="1s" repeatCount="indefinite">
                                <mpath href="#alert-path-5"/>
                              </animateMotion>
                              <animate attributeName="opacity" values="0;1;1;0" dur="1s" repeatCount="indefinite"/>
                            </circle>
                            <path id="alert-path-5" d="M 400,280 L 400,235" fill="none"/>
                            
                            {/* Network broadcasting alert */}
                            <circle cx="400" cy="175" r="20" fill="none" stroke="#ff4444" strokeWidth="3">
                              <animate attributeName="r" values="60;120;60" dur="2s" begin="1s" repeatCount="indefinite"/>
                              <animate attributeName="opacity" values="1;0;1" dur="2s" begin="1s" repeatCount="indefinite"/>
                            </circle>
                          </>
                        )}
                        
                        {/* Event labels */}
                        <text x="420" y="90" fill="#00aaff" fontSize="8" opacity="0.8">PROBE</text>
                        <text x="300" y="115" fill="#00ff88" fontSize="8" opacity="0.8">LOGIN</text>
                        <text x="480" y="115" fill="#00ff88" fontSize="8" opacity="0.8">BLOCKED</text>
                        <text x="300" y="235" fill="#ffaa00" fontSize="8" opacity="0.8">FLAGGED</text>
                        {networkAlerts.length > 0 && (
                          <text x="420" y="260" fill="#ff4444" fontSize="8" fontWeight="bold">FRAUD!</text>
                        )}
                        
                        {/* Network stats with signal types */}
                        <text x="20" y="20" fill="#00ff88" fontSize="10" opacity="0.8">
                          PROBE: 892/min • LOGIN: 2.3K/min • BLOCK: 147/min • FLAG: 83/min • TRUST: 421/min
                        </text>
                        <text x="20" y="330" fill="#00ff88" fontSize="10">
                          Active Stores: {networkSize} | Events/sec: 3,247 | Network Value: $1.3M protected
                        </text>
                      </svg>
                    </Box>
                    
                    {/* Status message */}
                    <Box background={networkAlerts.length > 0 ? "bg-surface-critical" : "bg-surface-success"} padding="200" borderRadius="100">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon source={networkAlerts.length > 0 ? AlertCircleIcon : TeamIcon} tone={networkAlerts.length > 0 ? "critical" : "success"} />
                        <Text variant="bodySm" fontWeight="semibold">
                          {networkAlerts.length > 0 
                            ? "Fraud detected! Network broadcasting alert to all connected stores..." 
                            : "Network operating normally. Stores sharing security signals in real-time."}
                        </Text>
                      </InlineStack>
                    </Box>
                  </BlockStack>
                </Box>
                
                {/* Jony Ive Inspired Visualization - A Breathing Circle of Light */}
                <Box background="bg-surface" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center" align="space-between">
                      <Text variant="headingSm" as="h3">Community Protection</Text>
                      <Badge tone="info">LIVE</Badge>
                    </InlineStack>
                    
                    <Box>
                      <svg width="100%" height="400" viewBox="0 0 800 400" style={{ background: '#000', borderRadius: '12px' }}>
                        <defs>
                          {/* Soft gradient for the protective halo */}
                          <radialGradient id="protectiveHalo">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15"/>
                            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05"/>
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                          </radialGradient>
                          
                          {/* Individual store light gradient */}
                          <radialGradient id="storeLight">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6"/>
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                          </radialGradient>
                          
                          {/* Threat gradient */}
                          <radialGradient id="threatApproach">
                            <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0"/>
                          </radialGradient>
                        </defs>
                        
                        {/* Your store - central breathing light */}
                        <circle cx="400" cy="200" r="8" fill="url(#storeLight)">
                          <animate attributeName="r" values="8;12;8" dur="4s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite"/>
                        </circle>
                        
                        {/* Surrounding stores - points of light forming protective circle */}
                        {[...Array(12)].map((_, i) => {
                          const angle = (i * 30) * Math.PI / 180;
                          const radius = 120;
                          const x = 400 + Math.cos(angle) * radius;
                          const y = 200 + Math.sin(angle) * radius;
                          const delay = i * 0.3;
                          
                          return (
                            <g key={i}>
                              <circle cx={x} cy={y} r="4" fill="white" opacity="0.6">
                                <animate 
                                  attributeName="opacity" 
                                  values="0.6;0.8;0.6" 
                                  dur="6s" 
                                  begin={`${delay}s`}
                                  repeatCount="indefinite"/>
                              </circle>
                              {/* Connection to center - subtle, almost invisible */}
                              <line x1="400" y1="200" x2={x} y2={y} stroke="white" strokeWidth="0.5" opacity="0.1"/>
                            </g>
                          );
                        })}
                        
                        {/* When threat detected - stores brighten in response */}
                        {networkAlerts.length > 0 && (
                          <>
                            {/* Threat approaching from outside */}
                            <circle cx="600" cy="100" r="40" fill="url(#threatApproach)">
                              <animate attributeName="r" values="40;60;40" dur="2s" repeatCount="indefinite"/>
                            </circle>
                            
                            {/* Protective halo forms */}
                            <circle cx="400" cy="200" r="150" fill="url(#protectiveHalo)">
                              <animate attributeName="r" values="120;180;120" dur="3s" repeatCount="indefinite"/>
                              <animate attributeName="opacity" values="0;0.3;0" dur="3s" repeatCount="indefinite"/>
                            </circle>
                            
                            {/* Nearby stores brighten in solidarity */}
                            {[...Array(5)].map((_, i) => {
                              const angle = ((i * 72) + 36) * Math.PI / 180;
                              const radius = 80;
                              const x = 400 + Math.cos(angle) * radius;
                              const y = 200 + Math.sin(angle) * radius;
                              
                              return (
                                <circle key={`bright-${i}`} cx={x} cy={y} r="6" fill="white" opacity="0.9">
                                  <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite"/>
                                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
                                </circle>
                              );
                            })}
                          </>
                        )}
                        
                        {/* Subtle movement - stores drift slightly, like breathing */}
                        <g opacity="0.4">
                          {[...Array(20)].map((_, i) => {
                            const x = Math.random() * 800;
                            const y = Math.random() * 400;
                            const size = Math.random() * 2 + 1;
                            const duration = Math.random() * 10 + 20;
                            
                            return (
                              <circle key={`ambient-${i}`} cx={x} cy={y} r={size} fill="white" opacity="0.3">
                                <animateTransform
                                  attributeName="transform"
                                  type="translate"
                                  values="0,0; 10,-10; -10,10; 0,0"
                                  dur={`${duration}s`}
                                  repeatCount="indefinite"/>
                              </circle>
                            );
                          })}
                        </g>
                        
                        {/* Single word of reassurance */}
                        <text x="400" y="350" fill="white" fontSize="14" textAnchor="middle" opacity="0.6" fontWeight="300">
                          {networkAlerts.length > 0 ? "Protected" : "Connected"}
                        </text>
                      </svg>
                    </Box>
                    
                    {/* Minimal status - almost invisible */}
                    <Box>
                      <Text variant="bodySm" tone="subdued" alignment="center">
                        {networkSize.toLocaleString()} stores • {networkAlerts.length > 0 ? "Threat detected" : "All clear"}
                      </Text>
                    </Box>
                    
                    {/* High-level indicators */}
                    <Box padding="300" background="bg-surface" borderRadius="100">
                      <InlineGrid columns={3} gap="400">
                        <Box>
                          <Text variant="bodyMd" tone="subdued">Customer Health</Text>
                          <Text variant="headingLg" fontWeight="semibold">94%</Text>
                          <Text variant="bodySm" tone="subdued">6% flagged</Text>
                        </Box>
                        <Box>
                          <Text variant="bodyMd" tone="subdued">Threats Today</Text>
                          <Text variant="headingLg" fontWeight="semibold">47</Text>
                          <Text variant="bodySm" tone="success">$5,420 saved</Text>
                        </Box>
                        <Box>
                          <Text variant="bodyMd" tone="subdued">Network Alert</Text>
                          <Text variant="bodyMd" fontWeight="semibold">Card Testing</Text>
                          <Text variant="bodySm" tone="subdued">NYC area</Text>
                        </Box>
                      </InlineGrid>
                    </Box>
                  </BlockStack>
                </Box>

                {/* Removed other concepts - focusing on the Network Intelligence Exchange */}
                <Box background="bg-surface-subdued" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center" align="space-between">
                      <Text variant="headingSm" as="h3">Fraud Contagion Tracker™</Text>
                      <Badge tone="critical">LIVE</Badge>
                    </InlineStack>
                    
                    <Box>
                      <div style={{ 
                        background: '#000', 
                        borderRadius: '8px', 
                        padding: '20px',
                        position: 'relative',
                        height: '300px',
                        overflow: 'hidden'
                      }}>
                        {/* Particle system effect */}
                        <style>{`
                          @keyframes float {
                            0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
                            50% { transform: translate(30px, -30px) scale(1.5); opacity: 1; }
                            100% { transform: translate(60px, 0) scale(0.5); opacity: 0; }
                          }
                          .virus-particle {
                            position: absolute;
                            width: 8px;
                            height: 8px;
                            background: #ff0000;
                            border-radius: 50%;
                            animation: float 3s infinite;
                          }
                          .protected-particle {
                            position: absolute;
                            width: 12px;
                            height: 12px;
                            background: #00ff00;
                            border-radius: 50%;
                            animation: float 4s infinite reverse;
                          }
                        `}</style>
                        
                        <div style={{ color: '#fff', textAlign: 'center', marginTop: '20px' }}>
                          <h2 style={{ fontSize: '48px', margin: 0, fontWeight: 'bold' }}>
                            {networkAlerts.length > 0 ? '⚠️ FRAUD OUTBREAK' : '✅ NETWORK HEALTHY'}
                          </h2>
                          <p style={{ fontSize: '24px', color: '#ff6b6b', margin: '10px 0' }}>
                            R₀ = 3.7 (1 fraud → 3.7 victims)
                          </p>
                          <div style={{ fontSize: '18px', marginTop: '20px' }}>
                            <span style={{ color: '#ff0000' }}>● Infected: 1</span>
                            <span style={{ margin: '0 20px', color: '#ffaa00' }}>● At Risk: 3</span>
                            <span style={{ color: '#00ff00' }}>● Protected: {networkSize}</span>
                          </div>
                        </div>
                        
                        {/* Animated particles */}
                        {networkAlerts.length > 0 && (
                          <>
                            <div className="virus-particle" style={{ left: '50%', top: '50%' }} />
                            <div className="virus-particle" style={{ left: '45%', top: '45%', animationDelay: '0.5s' }} />
                            <div className="virus-particle" style={{ left: '55%', top: '55%', animationDelay: '1s' }} />
                            <div className="protected-particle" style={{ left: '30%', top: '40%' }} />
                            <div className="protected-particle" style={{ left: '70%', top: '60%', animationDelay: '1s' }} />
                          </>
                        )}
                        
                        <div style={{ 
                          position: 'absolute', 
                          bottom: '20px', 
                          left: '50%', 
                          transform: 'translateX(-50%)',
                          fontSize: '14px',
                          color: '#888'
                        }}>
                          Just like contact tracing, but for fraud
                        </div>
                      </div>
                    </Box>
                  </BlockStack>
                </Box>
                
                {/* CONCEPT 5: Stock Market Ticker Style */}
                <Box background="bg-surface-subdued" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center" align="space-between">
                      <Text variant="headingSm" as="h3">Fraud Market Exchange</Text>
                      <Badge tone="success">TRADING</Badge>
                    </InlineStack>
                    
                    <Box>
                      <div style={{ 
                        background: '#0a0a0a', 
                        borderRadius: '8px', 
                        padding: '20px',
                        fontFamily: 'monospace',
                        color: '#00ff00'
                      }}>
                        {/* Ticker tape */}
                        <div style={{ 
                          overflow: 'hidden', 
                          whiteSpace: 'nowrap',
                          borderBottom: '2px solid #00ff00',
                          paddingBottom: '10px',
                          marginBottom: '20px'
                        }}>
                          <div style={{ 
                            display: 'inline-block',
                            animation: 'scroll 20s linear infinite'
                          }}>
                            <style>{`
                              @keyframes scroll {
                                0% { transform: translateX(100%); }
                                100% { transform: translateX(-100%); }
                              }
                            `}</style>
                            FRAUD_MIAMI ↓ $8,400 (-85%) • FRAUD_NYC ↓ $12,300 (-92%) • FRAUD_LA ↓ $6,700 (-78%) • NETWORK_SHIELD ↑ +73% • PROTECTED_STORES ↑ {networkSize} (+15%)
                          </div>
                        </div>
                        
                        {/* Big numbers display */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '48px', fontWeight: 'bold', color: networkAlerts.length > 0 ? '#ff0000' : '#00ff00' }}>
                            {networkAlerts.length > 0 ? '📉' : '📈'} ${networkAlerts.length > 0 ? '-8,400' : '+125,000'}
                          </div>
                          <div style={{ fontSize: '18px', marginTop: '10px' }}>
                            {networkAlerts.length > 0 ? 'FRAUD DETECTED' : 'FRAUD PREVENTED'}
                          </div>
                        </div>
                        
                        {/* Trading data */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '20px',
                          marginTop: '30px',
                          fontSize: '14px'
                        }}>
                          <div>
                            <div style={{ color: '#888' }}>VOLUME</div>
                            <div style={{ color: '#fff', fontSize: '20px' }}>17.4K</div>
                          </div>
                          <div>
                            <div style={{ color: '#888' }}>BLOCKED</div>
                            <div style={{ color: '#00ff00', fontSize: '20px' }}>843</div>
                          </div>
                          <div>
                            <div style={{ color: '#888' }}>SAVED</div>
                            <div style={{ color: '#00ff00', fontSize: '20px' }}>$125K</div>
                          </div>
                        </div>
                      </div>
                    </Box>
                  </BlockStack>
                </Box>
                
                {/* CONCEPT 2: Radar/Sonar Visualization */}
                <Box background="bg-surface-subdued" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center" align="space-between">
                      <Text variant="headingSm" as="h3">Fraud Detection Radar</Text>
                      <Badge tone="warning">Scanning</Badge>
                    </InlineStack>
                    
                    <Box>
                      <svg width="100%" height="250" viewBox="0 0 400 250" style={{ background: '#0a0a0a', borderRadius: '8px' }}>
                        {/* Radar circles */}
                        <circle cx="200" cy="125" r="40" fill="none" stroke="#0f4c0f" strokeWidth="1" opacity="0.5"/>
                        <circle cx="200" cy="125" r="80" fill="none" stroke="#0f4c0f" strokeWidth="1" opacity="0.4"/>
                        <circle cx="200" cy="125" r="120" fill="none" stroke="#0f4c0f" strokeWidth="1" opacity="0.3"/>
                        
                        {/* Radar sweep line */}
                        <line x1="200" y1="125" x2="200" y2="25" stroke="#00ff00" strokeWidth="2" opacity="0.8">
                          <animateTransform
                            attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            from="0 200 125"
                            to="360 200 125"
                            dur="4s"
                            repeatCount="indefinite"/>
                        </line>
                        
                        {/* Radar sweep gradient */}
                        <defs>
                          <radialGradient id="sweepGradient">
                            <stop offset="0%" stopColor="#00ff00" stopOpacity="0.6"/>
                            <stop offset="100%" stopColor="#00ff00" stopOpacity="0"/>
                          </radialGradient>
                        </defs>
                        
                        <path d="M 200,125 L 200,25 A 100,100 0 0,1 280,90 z" fill="url(#sweepGradient)" opacity="0.4">
                          <animateTransform
                            attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            from="0 200 125"
                            to="360 200 125"
                            dur="4s"
                            repeatCount="indefinite"/>
                        </path>
                        
                        {/* Threat blips */}
                        {networkAlerts.length > 0 ? (
                          <>
                            <circle cx="150" cy="100" r="5" fill="#ff0000">
                              <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
                            </circle>
                            <text x="150" y="90" fill="#ff0000" fontSize="10" textAnchor="middle">THREAT</text>
                            
                            <circle cx="250" cy="150" r="3" fill="#ffaa00">
                              <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite"/>
                            </circle>
                            <text x="250" y="165" fill="#ffaa00" fontSize="8" textAnchor="middle">SUSPICIOUS</text>
                          </>
                        ) : (
                          <text x="200" y="125" fill="#00ff00" fontSize="12" textAnchor="middle">SCANNING...</text>
                        )}
                        
                        {/* Center point */}
                        <circle cx="200" cy="125" r="3" fill="#00ff00"/>
                        <text x="200" y="240" fill="#00ff00" fontSize="10" textAnchor="middle">
                          Network Security Radar - {networkSize} Stores Protected
                        </text>
                      </svg>
                    </Box>
                  </BlockStack>
                </Box>
                
                {/* CONCEPT 3: Shield Network Visualization */}
                <Box background="bg-surface-subdued" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center" align="space-between">
                      <Text variant="headingSm" as="h3">Store Protection Shield Network</Text>
                      <Badge tone="success">Active</Badge>
                    </InlineStack>
                    
                    <Box>
                      <svg width="100%" height="250" viewBox="0 0 600 250" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: '8px' }}>
                        {/* Animated background grid */}
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f3460" strokeWidth="0.5" opacity="0.3"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)"/>
                        
                        {/* Central shield */}
                        <g transform="translate(300, 125)">
                          <path d="M 0,-40 L -30,-20 L -30,20 L 0,40 L 30,20 L 30,-20 Z" 
                                fill="#e94560" 
                                stroke="#f47068" 
                                strokeWidth="2">
                            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
                          </path>
                          <text x="0" y="5" fill="white" fontSize="20" textAnchor="middle" fontWeight="bold">SOS</text>
                        </g>
                        
                        {/* Connected store shields */}
                        <g>
                          {/* Store 1 */}
                          <circle cx="150" cy="80" r="25" fill="none" stroke="#16a34a" strokeWidth="2" opacity="0.8"/>
                          <circle cx="150" cy="80" r="20" fill="#16a34a" opacity="0.3"/>
                          <line x1="150" y1="80" x2="270" y2="105" stroke="#16a34a" strokeWidth="1" opacity="0.5">
                            <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="2s" repeatCount="indefinite"/>
                          </line>
                          <text x="150" y="85" fill="white" fontSize="10" textAnchor="middle">STORE</text>
                          
                          {/* Store 2 */}
                          <circle cx="450" cy="80" r="25" fill="none" stroke="#16a34a" strokeWidth="2" opacity="0.8"/>
                          <circle cx="450" cy="80" r="20" fill="#16a34a" opacity="0.3"/>
                          <line x1="450" y1="80" x2="330" y2="105" stroke="#16a34a" strokeWidth="1" opacity="0.5">
                            <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                          </line>
                          <text x="450" y="85" fill="white" fontSize="10" textAnchor="middle">STORE</text>
                          
                          {/* Store 3 */}
                          <circle cx="150" cy="170" r="25" fill="none" stroke="#16a34a" strokeWidth="2" opacity="0.8"/>
                          <circle cx="150" cy="170" r="20" fill="#16a34a" opacity="0.3"/>
                          <line x1="150" y1="170" x2="270" y2="145" stroke="#16a34a" strokeWidth="1" opacity="0.5">
                            <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="2s" begin="1s" repeatCount="indefinite"/>
                          </line>
                          <text x="150" y="175" fill="white" fontSize="10" textAnchor="middle">STORE</text>
                          
                          {/* Store 4 */}
                          <circle cx="450" cy="170" r="25" fill="none" stroke="#16a34a" strokeWidth="2" opacity="0.8"/>
                          <circle cx="450" cy="170" r="20" fill="#16a34a" opacity="0.3"/>
                          <line x1="450" y1="170" x2="330" y2="145" stroke="#16a34a" strokeWidth="1" opacity="0.5">
                            <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="2s" begin="1.5s" repeatCount="indefinite"/>
                          </line>
                          <text x="450" y="175" fill="white" fontSize="10" textAnchor="middle">STORE</text>
                        </g>
                        
                        {/* Threat indicators */}
                        {networkAlerts.length > 0 && (
                          <>
                            <circle cx="150" cy="80" r="30" fill="none" stroke="#ff0000" strokeWidth="3" opacity="0">
                              <animate attributeName="r" values="25;35;25" dur="1s" repeatCount="indefinite"/>
                              <animate attributeName="opacity" values="0;0.8;0" dur="1s" repeatCount="indefinite"/>
                            </circle>
                            <text x="300" y="200" fill="#ff0000" fontSize="12" textAnchor="middle" fontWeight="bold">
                              THREAT BLOCKED BY NETWORK SHIELD
                            </text>
                          </>
                        )}
                        
                        <text x="300" y="230" fill="#16a34a" fontSize="11" textAnchor="middle">
                          {networkSize} Stores Connected • Real-time Protection • Stronger Together
                        </text>
                      </svg>
                    </Box>
                  </BlockStack>
                </Box>
                
                {networkAlerts.length > 0 && (
                  <Banner tone="critical" title="Active Network Alert">
                    <BlockStack gap="200">
                      <Text variant="bodyMd" fontWeight="semibold">
                        {networkAlerts[0].store} detected: {networkAlerts[0].threat}
                      </Text>
                      <Text variant="bodySm" tone="subdued">
                        Location: {networkAlerts[0].location} • {networkAlerts[0].time}
                      </Text>
                    </BlockStack>
                  </Banner>
                )}
                
                {liveNetworkActivity.length > 0 && (
                  <Box background="bg-surface-secondary" padding="400" borderRadius="200">
                    <BlockStack gap="300">
                      <Text variant="headingSm" as="h3">Network Protection in Action</Text>
                      {liveNetworkActivity.map((activity, index) => (
                        <InlineStack key={index} gap="200" align="space-between">
                          <InlineStack gap="200">
                            <Box width="8px" minHeight="8px" borderRadius="100" background="bg-success" />
                            <Text variant="bodySm">{activity.store}</Text>
                          </InlineStack>
                          <Text variant="bodySm" tone="subdued">{activity.action} • {activity.time}</Text>
                        </InlineStack>
                      ))}
                    </BlockStack>
                  </Box>
                )}
                
                <Box background="bg-surface-subdued" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    {/* Network Strength Meter - Like Waze */}
                    <Box>
                      <InlineStack gap="200" blockAlign="center" align="space-between">
                        <Text variant="headingSm" as="h4">Network Protection Strength</Text>
                        <Badge tone="success">87% Coverage</Badge>
                      </InlineStack>
                      <Box paddingBlockStart="200">
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e5e5', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: '87%', 
                            height: '100%', 
                            background: 'linear-gradient(to right, #16a34a, #22c55e)', 
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                      </Box>
                      <Text variant="bodySm" tone="subdued">
                        Like Waze, our fraud detection gets stronger with every new merchant
                      </Text>
                    </Box>
                    
                    <Divider />
                    
                    <InlineGrid columns={{xs: 2, sm: 4}} gap="400">
                      <BlockStack gap="100">
                        <Text variant="bodySm" tone="subdued">Network Size</Text>
                        <Text variant="headingMd" fontWeight="bold">{networkSize} stores</Text>
                      </BlockStack>
                      <BlockStack gap="100">
                        <Text variant="bodySm" tone="subdued">Frauds Prevented</Text>
                        <Text variant="headingMd" fontWeight="bold">843 this month</Text>
                      </BlockStack>
                      <BlockStack gap="100">
                        <Text variant="bodySm" tone="subdued">Amount Saved</Text>
                        <Text variant="headingMd" fontWeight="bold">$125,000</Text>
                      </BlockStack>
                      <BlockStack gap="100">
                        <Text variant="bodySm" tone="subdued">Active Alerts</Text>
                        <Text variant="headingMd" fontWeight="bold">3 now</Text>
                      </BlockStack>
                    </InlineGrid>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Box>
          </Card>

          {/* Network Economics & Trust Metrics */}
          <Card>
            <Box padding="600">
              <BlockStack gap="400">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={TeamIcon} tone="interactive" />
                  <Text variant="headingLg" as="h2">Network Economics</Text>
                  <Badge tone="magic">Real-time</Badge>
                </InlineStack>
                
                {/* Signal Flow Visualization */}
                <Box background="bg-surface-subdued" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <Text variant="headingSm">Signal Flow Economics</Text>
                    
                    <Box>
                      <svg width="100%" height="200" viewBox="0 0 800 200" style={{ background: '#0a0f1b', borderRadius: '8px' }}>
                        <defs>
                          <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.2"/>
                            <stop offset="50%" stopColor="#00ff88" stopOpacity="0.8"/>
                            <stop offset="100%" stopColor="#00ff88" stopOpacity="0.2"/>
                          </linearGradient>
                        </defs>
                        
                        {/* Signal type bars with animation */}
                        <g>
                          {/* PROBE signals */}
                          <rect x="50" y="30" width="120" height="20" fill="#00aaff" opacity="0.8"/>
                          <text x="60" y="45" fill="white" fontSize="12">PROBE: 892/min</text>
                          <rect x="50" y="30" width="120" height="20" fill="url(#signalGradient)">
                            <animate attributeName="x" values="50;650;50" dur="3s" repeatCount="indefinite"/>
                          </rect>
                          
                          {/* TRUST signals */}
                          <rect x="50" y="60" width="80" height="20" fill="#00ff88" opacity="0.8"/>
                          <text x="60" y="75" fill="white" fontSize="12">TRUST: 421/min</text>
                          <rect x="50" y="60" width="80" height="20" fill="url(#signalGradient)">
                            <animate attributeName="x" values="50;650;50" dur="4s" repeatCount="indefinite"/>
                          </rect>
                          
                          {/* BLOCK signals */}
                          <rect x="50" y="90" width="60" height="20" fill="#ff4444" opacity="0.8"/>
                          <text x="60" y="105" fill="white" fontSize="12">BLOCK: 147/min</text>
                          <rect x="50" y="90" width="60" height="20" fill="url(#signalGradient)">
                            <animate attributeName="x" values="50;650;50" dur="5s" repeatCount="indefinite"/>
                          </rect>
                          
                          {/* FLAG signals */}
                          <rect x="50" y="120" width="40" height="20" fill="#ffaa00" opacity="0.8"/>
                          <text x="60" y="135" fill="white" fontSize="12">FLAG: 83/min</text>
                          <rect x="50" y="120" width="40" height="20" fill="url(#signalGradient)">
                            <animate attributeName="x" values="50;650;50" dur="6s" repeatCount="indefinite"/>
                          </rect>
                        </g>
                        
                        {/* Network value indicator */}
                        <text x="400" y="180" fill="#00ff88" fontSize="14" textAnchor="middle" fontWeight="bold">
                          Network Trust Score: 94.7% | Response Time: 43ms avg
                        </text>
                      </svg>
                    </Box>
                  </BlockStack>
                </Box>
                
                {/* Trust Derived Metrics */}
                <InlineGrid columns={2} gap="400">
                  <Box background="bg-surface-secondary" padding="400" borderRadius="200">
                    <BlockStack gap="300">
                      <Text variant="headingSm">Trust Actions Today</Text>
                      <Text variant="heading2xl" fontWeight="bold">48,247</Text>
                      <BlockStack gap="100">
                        <InlineStack gap="200" align="space-between">
                          <Text variant="bodySm">Whitelist actions</Text>
                          <Text variant="bodySm" fontWeight="semibold">12,841</Text>
                        </InlineStack>
                        <InlineStack gap="200" align="space-between">
                          <Text variant="bodySm">Trust verifications</Text>
                          <Text variant="bodySm" fontWeight="semibold">28,392</Text>
                        </InlineStack>
                        <InlineStack gap="200" align="space-between">
                          <Text variant="bodySm">Risk downgrades</Text>
                          <Text variant="bodySm" fontWeight="semibold">7,014</Text>
                        </InlineStack>
                      </BlockStack>
                    </BlockStack>
                  </Box>
                  
                  <Box background="bg-surface-secondary" padding="400" borderRadius="200">
                    <BlockStack gap="300">
                      <Text variant="headingSm">Network Value Created</Text>
                      <Text variant="heading2xl" fontWeight="bold">$1.3M</Text>
                      <BlockStack gap="100">
                        <InlineStack gap="200" align="space-between">
                          <Text variant="bodySm">Fraud prevented</Text>
                          <Text variant="bodySm" fontWeight="semibold">$847K</Text>
                        </InlineStack>
                        <InlineStack gap="200" align="space-between">
                          <Text variant="bodySm">False positives avoided</Text>
                          <Text variant="bodySm" fontWeight="semibold">$312K</Text>
                        </InlineStack>
                        <InlineStack gap="200" align="space-between">
                          <Text variant="bodySm">Time saved (hours)</Text>
                          <Text variant="bodySm" fontWeight="semibold">2,847</Text>
                        </InlineStack>
                      </BlockStack>
                    </BlockStack>
                  </Box>
                </InlineGrid>
                
                {/* Merchant Behavior Insights */}
                <Box background="bg-surface-secondary" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <Text variant="headingSm">How Merchants Use the Network</Text>
                    <InlineGrid columns={3} gap="300">
                      <BlockStack gap="100">
                        <Text variant="headingMd" fontWeight="semibold">67%</Text>
                        <Text variant="bodySm">Check every new customer</Text>
                      </BlockStack>
                      <BlockStack gap="100">
                        <Text variant="headingMd" fontWeight="semibold">89%</Text>
                        <Text variant="bodySm">Trust network decisions</Text>
                      </BlockStack>
                      <BlockStack gap="100">
                        <Text variant="headingMd" fontWeight="semibold">4.2x</Text>
                        <Text variant="bodySm">More likely to whitelist</Text>
                      </BlockStack>
                    </InlineGrid>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Box>
          </Card>

          {/* ROI Calculator */}
          <Card>
            <Box padding="600">
              <BlockStack gap="400">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={CashDollarIcon} tone="success" />
                  <Text variant="headingLg" as="h2">ROI Calculator</Text>
                  <Badge tone="success">Live Demo</Badge>
                </InlineStack>
                
                <BlockStack gap="300">
                  <TextField
                    label="Your monthly revenue"
                    type="number"
                    value={monthlyRevenue}
                    onChange={(value) => {
                      setMonthlyRevenue(value);
                      setRoiCalculated(false);
                    }}
                    prefix="$"
                    autoComplete="off"
                  />
                  
                  <Button 
                    variant="primary" 
                    fullWidth
                    onClick={() => setRoiCalculated(true)}
                    disabled={!isHydrated || !isMounted}
                  >
                    Calculate My Savings
                  </Button>
                  
                  {roiCalculated && monthlyRevenue && (
                    <Box background="bg-surface-success" padding="400" borderRadius="200">
                      <BlockStack gap="200">
                        <Text variant="headingSm" as="h3">Your Projected Savings with SOS:</Text>
                        <InlineGrid columns={{xs: 1, sm: 3}} gap="400">
                          <BlockStack gap="100">
                            <Text variant="bodySm" tone="subdued">Monthly Savings</Text>
                            <Text variant="headingMd" fontWeight="bold" tone="success">
                              ${(parseFloat(monthlyRevenue) * 0.025).toLocaleString()}
                            </Text>
                          </BlockStack>
                          <BlockStack gap="100">
                            <Text variant="bodySm" tone="subdued">Annual Savings</Text>
                            <Text variant="headingMd" fontWeight="bold" tone="success">
                              ${(parseFloat(monthlyRevenue) * 0.025 * 12).toLocaleString()}
                            </Text>
                          </BlockStack>
                          <BlockStack gap="100">
                            <Text variant="bodySm" tone="subdued">ROI</Text>
                            <Text variant="headingMd" fontWeight="bold" tone="success">
                              {((parseFloat(monthlyRevenue) * 0.025 * 12 - 1188) / 1188 * 100).toFixed(0)}%
                            </Text>
                          </BlockStack>
                        </InlineGrid>
                        <Text variant="bodySm" tone="subdued">
                          Based on industry average 2.5% fraud reduction • $99/month investment
                        </Text>
                      </BlockStack>
                    </Box>
                  )}
                </BlockStack>
              </BlockStack>
            </Box>
          </Card>

          {/* Merchant Testimonials */}
          <Card>
            <Box padding="600">
              <BlockStack gap="400">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={TeamIcon} tone="base" />
                  <Text variant="headingLg" as="h2">What Merchants Say</Text>
                </InlineStack>
                
                <InlineGrid columns={{xs: 1, sm: 3}} gap="400">
                  <Box background="bg-surface-subdued" padding="400" borderRadius="200">
                    <BlockStack gap="200">
                      <Text variant="bodySm" tone="subdued">"SOS caught 12 fraudulent orders in our first week. That's $8,400 saved!"</Text>
                      <Text variant="bodySm" fontWeight="semibold">- TechGear Pro</Text>
                      <Text variant="bodySm" tone="subdued">⭐⭐⭐⭐⭐</Text>
                    </BlockStack>
                  </Box>
                  
                  <Box background="bg-surface-subdued" padding="400" borderRadius="200">
                    <BlockStack gap="200">
                      <Text variant="bodySm" tone="subdued">"The network alerts are incredible. We blocked 3 scammers other stores flagged."</Text>
                      <Text variant="bodySm" fontWeight="semibold">- Fashion Forward NYC</Text>
                      <Text variant="bodySm" tone="subdued">⭐⭐⭐⭐⭐</Text>
                    </BlockStack>
                  </Box>
                  
                  <Box background="bg-surface-subdued" padding="400" borderRadius="200">
                    <BlockStack gap="200">
                      <Text variant="bodySm" tone="subdued">"73% reduction in chargebacks. SOS pays for itself 10x over."</Text>
                      <Text variant="bodySm" fontWeight="semibold">- Beauty Haven</Text>
                      <Text variant="bodySm" tone="subdued">⭐⭐⭐⭐⭐</Text>
                    </BlockStack>
                  </Box>
                </InlineGrid>
              </BlockStack>
            </Box>
          </Card>

          {/* Fraud Checks Table with Export */}
          <Card>
            <Box padding="600">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingLg" as="h2">Recent Fraud Checks</Text>
                  <ButtonGroup>
                    {isHydrated && isMounted && (
                      <Button 
                        variant="plain" 
                        icon={CashDollarIcon}
                        onClick={handleExport}
                      >
                        Export
                      </Button>
                    )}
                    <Button variant="plain">View all</Button>
                  </ButtonGroup>
                </InlineStack>
                
                <FraudCheckTable />
                
                <InlineStack gap="400">
                  <Box>
                    <InlineStack gap="100" blockAlign="center">
                      <Box width="12px" minHeight="12px" borderRadius="100" background="bg-success" />
                      <Text variant="bodySm" as="span">Safe (0-30)</Text>
                    </InlineStack>
                  </Box>
                  <Box>
                    <InlineStack gap="100" blockAlign="center">
                      <Box width="12px" minHeight="12px" borderRadius="100" background="bg-warning" />
                      <Text variant="bodySm" as="span">Review (31-70)</Text>
                    </InlineStack>
                  </Box>
                  <Box>
                    <InlineStack gap="100" blockAlign="center">
                      <Box width="12px" minHeight="12px" borderRadius="100" background="bg-critical" />
                      <Text variant="bodySm" as="span">High Risk (71-100)</Text>
                    </InlineStack>
                  </Box>
                </InlineStack>
              </BlockStack>
            </Box>
          </Card>
        </BlockStack>
      </Page>
  );
}
