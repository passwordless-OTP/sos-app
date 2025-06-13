# SOS App - Shopify Fraud Prevention

AI-powered fraud prevention network for Shopify stores, built on Gadget.dev.

## 🏗️ Architecture Relationship: SOS Core ← → SOS Shopify App

```
┌─────────────────────────┐         ┌──────────────────────────┐
│      SOS (Core)         │   API   │   SOS-Shopify-App       │
│                         │ <-----> │    (Client App)          │
│  • Risk Engine          │         │  • Shopify Integration   │
│  • Fraud Detection APIs │         │  • Merchant Dashboard    │
│  • Network Intelligence │         │  • Webhook Handlers      │
│  • ML Models           │         │  • Gadget.dev Platform   │
└─────────────────────────┘         └──────────────────────────┘
          ↑                                     ↓
          └─────────── API Calls ───────────────┘
```

### Component Responsibilities

**SOS Core (Parent Repository)**
- Master fraud detection engine
- Aggregates data from 17+ fraud detection APIs
- Manages network intelligence database
- Platform-agnostic API layer
- Machine learning models for risk scoring

**SOS-Shopify-App (This Repository)**
- Shopify-specific implementation
- Consumes SOS Core APIs
- Handles Shopify webhooks
- Merchant dashboard UI
- Order fraud checking interface

## 🚀 About Gadget.dev

This app is built on [Gadget.dev](https://gadget.dev), a full-stack platform for building Shopify apps. Gadget provides:
- Instant Shopify API connections
- Built-in database (PostgreSQL)
- Serverless hosting
- React + Node.js environment
- Automatic scaling

## 📁 Project Structure

```
sos-app/
├── api/
│   ├── models/              # Data models
│   │   ├── fraudCheck.js    # Fraud check records
│   │   ├── networkIntelligence.js  # Shared fraud data
│   │   └── shop.js          # Connected stores
│   └── actions/             # API endpoints
│       ├── checkOrder.js    # Main fraud detection
│       ├── reportFraud.js   # Network intelligence
│       └── getDashboardStats.js  # Analytics
├── web/
│   ├── routes/              # Frontend pages
│   │   └── _app._index.tsx  # Main dashboard
│   └── components/          # React components
├── shopify.app.toml         # Shopify app config
└── package.json
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+
- Shopify Partner account
- Gadget.dev account

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/passwordless-OTP/sos-app.git
   cd sos-app
   ```

2. **Install Gadget CLI**
   ```bash
   npm install -g @gadget-client/cli
   ```

3. **Login to Gadget**
   ```bash
   gadget login
   ```

4. **Pull from Gadget**
   ```bash
   gadget pull sosv02
   ```

5. **Start development server**
   ```bash
   gadget dev
   ```

### Deployment

The app auto-deploys on Gadget.dev when you:
- Push changes through Gadget editor
- Deploy via CLI: `gadget deploy`

### Environment Variables

Set these in your Gadget app settings:
```env
# SOS Core API Connection
SOS_API_ENDPOINT=https://api.sos-fraud.com/v1
SOS_API_KEY=your_api_key_here

# Shopify App (auto-configured by Gadget)
SHOPIFY_API_KEY=auto_configured
SHOPIFY_API_SECRET=auto_configured
```

## 🔄 How It Works

1. **Order Created** → Shopify webhook triggers
2. **Data Collection** → Extract customer email, IP, phone
3. **API Call** → Send to SOS Core for analysis
4. **Risk Scoring** → Core returns fraud score (0-100)
5. **Action** → Tag order if high risk, notify merchant
6. **Network Update** → Share intelligence with network

### Example API Communication

```javascript
// In checkOrder action (Gadget)
export async function checkOrder({ params, api }) {
  // 1. Get order data from Shopify
  const orderData = params;
  
  // 2. Call SOS Core API
  const fraudCheck = await fetch('https://api.sos-fraud.com/v1/check', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SOS_API_KEY}`,
      'X-Platform': 'shopify'
    },
    body: JSON.stringify({
      email: orderData.email,
      ip: orderData.ipAddress,
      phone: orderData.phone,
      amount: orderData.totalPrice
    })
  });
  
  // 3. Store result in Gadget database
  return await api.fraudCheck.create(fraudCheck);
}
```

## 🧪 Testing

1. **Install on development store**
   ```bash
   gadget open
   ```
   Then click "Install on Development Store"

2. **Test fraud check**
   - Create test order with suspicious email (e.g., test@guerrillamail.com)
   - Check dashboard for risk score
   - Verify order tags in Shopify admin

## 📊 Key Features

- **Real-time Fraud Detection**: Check orders against 17+ APIs
- **Network Intelligence**: Learn from 17,453+ connected stores
- **Polaris UI**: Native Shopify look and feel
- **Automatic Webhooks**: Orders checked automatically
- **Risk Scoring**: 0-100 score with detailed reasons

## 🔗 Related Repositories

- **[SOS Core](https://github.com/passwordless-OTP/SOS)** - Main fraud detection platform
- **[Risk Engine](https://github.com/passwordless-OTP/SOS/tree/main/packages/risk-engine)** - Core scoring logic
- **[API Clients](https://github.com/passwordless-OTP/SOS/tree/main/packages/api-clients)** - External API integrations

## 📈 Performance

- Average fraud check: < 500ms
- 99.9% uptime on Gadget infrastructure
- Auto-scaling for Black Friday/Cyber Monday
- Real-time network updates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

- **Documentation**: [Gadget Docs](https://docs.gadget.dev)
- **Issues**: [GitHub Issues](https://github.com/passwordless-OTP/sos-app/issues)
- **Email**: support@sos-fraud.com

---

**Built with ❤️ for the Shopify ecosystem by the SOS team**
