# SOS Project Instructions

## Project Overview
SOS (Store Operations Shield) is an AI-powered fraud prevention and intelligence platform for Shopify merchants. It functions as "Waze for Shopify Security" - creating a community-driven network where merchants share security signals.

## Repository Structure
This project consists of two repositories:
1. **SOS (outer repo)**: Main project repository with documentation and infrastructure
2. **sosv02 (inner repo)**: Gadget.dev Shopify app at `/apps/sosv02/apps/sosv02/`

## Key Technologies
- **Framework**: Gadget.dev (full-stack Shopify app framework)
- **Frontend**: React, TypeScript, Shopify Polaris, Vite
- **Backend**: Node.js, Express, PostgreSQL, Redis
- **AI**: OpenAI API for natural language processing
- **External APIs**: Multiple fraud detection services (AbuseIPDB, EmailRep, IPQualityScore, etc.)

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow Shopify Polaris design patterns for UI components
- Use async/await for asynchronous operations
- Implement proper error handling with try-catch blocks

### Architecture Patterns
- Microservices architecture for scalability
- Circuit breakers for external API calls
- Multi-layer caching (Redis) for performance
- Webhook-based Shopify integration

### Testing
- Write unit tests for fraud detection algorithms
- Integration tests for external API connections
- E2E tests for critical user flows

### Security
- Never expose API keys in code
- Sanitize all user inputs
- Use environment variables for sensitive configuration
- Follow Shopify app security best practices

## Common Commands

### Outer Repository (SOS)
```bash
# Development
npm run dev

# Testing
npm test
npm run test:integration

# Linting
npm run lint
npm run typecheck

# Build
npm run build
```

### Inner Repository (sosv02) - Gadget App
```bash
# Navigate to Gadget app
cd apps/sosv02/apps/sosv02

# Install dependencies
npm install

# Start development
npm run dev

# Build
npm run build
```

## Project Structure

### Outer Repository (/)
- `/docs` - Project documentation and strategies
- `/infrastructure` - Docker and deployment configs
- `/sos-app` - Shopify app submodule

### Inner Repository (/apps/sosv02/apps/sosv02)
- `/api` - Backend API models and actions
  - `/actions` - Global actions (checkOrder, getDashboardStats, reportFraud)
  - `/models` - Data models (fraudCheck, NetworkIntelligence, shop, etc.)
- `/web` - Frontend React application
  - `/components` - Reusable UI components
  - `/routes` - Page routes and views
- `/accessControl` - Permission filters and access control
- `/services` - Microservices (lookup-aggregator)

## Key Files
- `settings.gadget.ts` - Gadget app configuration
- `shopify.app.toml` - Shopify app configuration
- `api/actions/checkOrder` - Main fraud checking logic
- `api/models/NetworkIntelligence` - Network intelligence data model
- `services/lookup-aggregator` - External API aggregation service

## Important Notes
- This is a fraud prevention system - ensure all security checks are thorough
- Performance is critical - use caching strategically
- Network effects are key - design for scalability from day one
- Follow usage-based pricing model for API calls
- The Gadget.dev framework handles Shopify OAuth and webhooks automatically
- Use Gadget's built-in session management for authentication

## Recent Work (2025-06-17)
- **Network Intelligence Dashboard**: Completed comprehensive dashboard with real-time visualizations
- **Customer Risk Intelligence**: Shows health scores and network-flagged customers
- **Network Economics**: Live signal flow (PROBE, TRUST, BLOCK, FLAG) with 3,247 signals/sec
- **Visualizations**: Created 6 concepts including Jony Ive-inspired "Community Protection"
- **Key Files Modified**: 
  - `/apps/sosv02/web/routes/_app._index.tsx` - Main dashboard (717+ lines added)
  - Created `jony-ive-demo.html` for standalone demo
- **Architecture Docs**: Created ARCHITECTURE_VISUAL.md and ARCHITECTURE_PROBLEMS.md

## SOS File Naming Convention

Follow DNS-style naming for all SOS files:

### Structure: `[namespace].[category].[feature].[descriptor].[extension]`

### Examples:
- `sos.dashboard.investor-demo.wireframe.[BIG-NUMBERS].png`
- `sos.api.fraud-check.[MAIN].ts`
- `sos.docs.product.vision-mission.[VMS-VARIANT].md`
- `sos.config.gadget.settings.[DEVELOPMENT].ts`
- `sos.analytics.conversion-metrics.[2025-01-17].csv`
- `sos.components.dashboard.friction-tab.[REACT].tsx`

### SOS-Specific Categories:
- **sos.api**: API actions and models
- **sos.docs**: Documentation files
- **sos.config**: Configuration files
- **sos.components**: React components
- **sos.services**: Microservices
- **sos.tests**: Test files
- **sos.analytics**: Analytics and metrics
- **sos.security**: Security-related files

### Benefits for SOS:
- Easy to identify SOS files vs other projects
- Clear module organization
- Consistent with Gadget.dev structure
- Supports versioning and variants