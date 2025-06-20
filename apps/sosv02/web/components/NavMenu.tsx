import { Link } from "@remix-run/react";
import { NavMenu as AppBridgeNavMenu } from "@shopify/app-bridge-react";

export function NavMenu() {
  return (
    <AppBridgeNavMenu>
      <Link to="/" rel="home">
        Dashboard
      </Link>
      <Link to="/investor-demo">
        Investor Demo
      </Link>
    </AppBridgeNavMenu>
  );
}
