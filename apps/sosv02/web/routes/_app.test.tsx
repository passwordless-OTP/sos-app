import { Page, Layout, Card, Text } from '@shopify/polaris';
import { json } from "@remix-run/node";

export const loader = async () => {
  return json({ 
    message: "Test route working",
    timestamp: new Date().toISOString()
  });
};

export default function TestRoute() {
  return (
    <Page title="Test Route">
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="p">If you can see this, the app is working!</Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}