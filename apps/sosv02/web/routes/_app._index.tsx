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

// Disable server-side rendering for this route
export const clientOnly = true;

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const shop = context.session?.get("shop");
  return json({
    shopId: shop?.id || null,
    shopDomain: shop?.domain || null
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
                </Box>
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
