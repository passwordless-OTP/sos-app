# SOS - Store Operations Shield

> AI-powered Shopify security intelligence network - The Waze for fraud prevention

[![CI Status](https://github.com/passwordless-OTP/SOS/workflows/CI/badge.svg)](https://github.com/passwordless-OTP/SOS/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Shopify App](https://img.shields.io/badge/Shopify-App-green.svg)](https://apps.shopify.com/sos)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/passwordless-OTP/SOS.git
cd SOS

# Run setup script
./scripts/dev-setup.sh

# Start development environment
docker-compose -f infrastructure/docker/docker-compose.dev.yml up
```

## 📋 Features

- ✅ Multi-source fraud detection (17+ APIs)
- ✅ AI-powered risk scoring
- ✅ Real-time lookup aggregation
- ✅ Network intelligence sharing
- ✅ Shopify native integration

## 🏗️ Architecture

See [Architecture Overview](docs/architecture/system-design.md) for detailed system design.

## 📊 Project Structure

```
SOS/
├── apps/              # Applications
│   ├── shopify-app/   # Main Shopify app (Gadget.dev)
│   └── api-gateway/   # API aggregation service
├── packages/          # Shared packages
│   ├── risk-engine/   # Core risk scoring logic
│   └── api-clients/   # API client libraries
├── services/          # Microservices
├── infrastructure/    # Docker, K8s, Terraform
├── docs/             # Documentation
└── tests/            # Test suites
```

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://github.com/passwordless-OTP/SOS/wiki)
- [Project Board](https://github.com/passwordless-OTP/SOS/projects)
- [Issues](https://github.com/passwordless-OTP/SOS/issues)
