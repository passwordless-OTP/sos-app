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

## Critical Development Rules

### 1. Never Assume - Always Verify
- NEVER assume a library export exists (e.g., icon names, functions)
- NEVER guess at API signatures or property names
- ALWAYS check existing working code for patterns

### 2. Copy Working Examples
```bash
# Before importing anything new:
grep -r "from '@shopify/polaris-icons'" . | head -20
# Copy EXACTLY what works - don't modify
```

### 3. Automated Verification After EVERY Change
```bash
# After ANY edit (even "trivial" ones):
npm run typecheck  # Catches import/type errors instantly
npm run lint       # Catches syntax errors
npm run build      # Full compilation check

# NEVER batch multiple changes without testing
```

### 4. Trust the Tools
- If TypeScript says it doesn't exist, it doesn't exist
- Don't argue with "module not found" errors
- The compiler knows better than your assumptions

### 5. Fail Fast Philosophy
- Make ONE atomic change
- Test immediately
- Only proceed if green
- This prevents cascading errors and saves debugging time

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