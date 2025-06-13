# Gadget.dev REST API capabilities for Shopify app management

Gadget.dev offers **comprehensive programmatic management capabilities** through a combination of automatically generated GraphQL APIs, a powerful CLI tool (ggt), and flexible HTTP routing options. While primarily GraphQL-focused rather than traditional REST, Gadget provides robust programmatic control that rivals or exceeds major platforms like Heroku and Vercel.

## Core API capabilities exceed traditional REST approaches

Gadget.dev takes a **GraphQL-first approach** that automatically generates powerful APIs for every data model in your application. Each Shopify app built on Gadget instantly receives both public and private APIs with full CRUD operations, real-time subscriptions, and advanced querying capabilities. The platform generates **type-safe JavaScript/TypeScript clients** (`@gadget-client/your-app-name`) that provide programmatic access to all application functionality, making it exceptionally developer-friendly compared to traditional REST APIs.

The automatically generated APIs include sophisticated features like computed fields for pre-aggregated values, client-side pagination supporting up to 250 records per page, and advanced filtering using Gadget's "Gelly" query language. While Gadget primarily uses GraphQL, developers can create **custom HTTP routes** in the `/routes` folder supporting all HTTP verbs (GET, POST, PUT, DELETE) for REST-style endpoints when needed. This flexibility allows integration with webhooks and external services that require REST interfaces.

## The ggt CLI enables comprehensive programmatic management

The **Gadget CLI tool (ggt)** serves as the primary interface for programmatic app management, offering capabilities that match or exceed traditional PaaS platforms. Installation is straightforward via npm (`npm install -g ggt`), and the tool provides bidirectional file synchronization between local and cloud environments, enabling developers to use their preferred editors while maintaining real-time updates.

Key CLI commands include `ggt dev` for two-way file sync, `ggt deploy` for production deployments, `ggt add` for creating models and actions, and `ggt push/pull` for managing code changes. The CLI supports **Git-based workflows**, environment switching, and conflict resolution, making it suitable for team development and CI/CD integration. Unlike platforms that require complex configuration, Gadget's CLI abstracts infrastructure complexity while providing powerful automation capabilities.

## API documentation and developer resources surpass industry standards

Gadget provides **auto-generated API documentation** specific to each application, accessible through the platform's web interface. Every app includes an integrated GraphQL playground for testing queries and mutations, along with an interactive schema explorer. The documentation automatically updates as developers modify their data models, ensuring accuracy without manual maintenance.

Official documentation resides at `https://docs.gadget.dev`, with comprehensive guides covering API usage, CLI commands, and integration patterns. The platform also provides **extensive TypeScript definitions** for all generated code, enabling IDE autocomplete and type checking throughout the development process. This level of documentation automation significantly reduces the overhead typically associated with maintaining API documentation.

## Authentication leverages modern security patterns

Gadget implements multiple authentication methods tailored to different use cases. **API key authentication** uses keys prefixed with `gsk-` for server-to-server communication, supporting role-based access control with granular permissions. Browser applications utilize **session-based authentication** with tokens stored in localStorage for cross-domain compatibility.

The platform includes **built-in OAuth support** for Google authentication and custom OAuth providers, with production-ready configuration management. For Shopify applications specifically, Gadget handles **Shopify OAuth PKCE flows** automatically, managing session tokens and cross-frame security without developer intervention. This comprehensive authentication system eliminates the complexity typically associated with implementing secure authentication in Shopify apps.

## Developer tools ecosystem provides end-to-end solutions

Beyond the CLI, Gadget offers a rich ecosystem of developer tools. The **@gadgetinc/react** library provides React hooks for seamless backend integration, built on the urql GraphQL client with features like document caching and request deduplication. The **gadget-server** package offers backend utilities including logger instances, API clients with system-admin privileges, and connection helpers for external services.

For Shopify development, **@gadgetinc/react-shopify-app-bridge** handles App Bridge integration, OAuth flows, and iframe-safe session management. All packages are distributed through Gadget's custom NPM registry with full TypeScript support. The platform also includes a **web-based IDE** with model generators, real-time logs, schema visualization, and permission management interfaces, though most developers prefer local development with the CLI.

## Platform comparison reveals unique advantages and trade-offs

When compared to **Heroku**, Gadget offers superior API generation and Shopify-specific features but lacks Heroku's extensive buildpack ecosystem and language flexibility. Heroku's Platform API provides comprehensive REST endpoints for app creation, deployment, and management, with mature CI/CD integration. However, Heroku requires manual API development and doesn't offer Gadget's automatic API generation or built-in Shopify integration.

**Vercel** excels at frontend deployment with its REST API supporting programmatic deployments, environment management, and edge functions. Vercel's API is well-documented with official SDKs, but it's primarily focused on static sites and serverless functions. Gadget provides a more comprehensive full-stack solution with database management, background jobs, and complex application logic - features that Vercel doesn't natively support.

## Infrastructure as Code follows configuration-as-code patterns

While Gadget **doesn't support traditional IaC tools** like Terraform or CloudFormation, it implements configuration-as-code through version-controlled metadata files. All application configuration, including database schemas, settings, and permissions, is captured in `.gadget.ts` files that can be managed through Git. This approach provides versioning and reproducibility without the complexity of infrastructure provisioning.

The platform supports **Git-based workflows** with GitHub and GitLab integration, enabling branch-based development and pull request workflows. However, it lacks true GitOps automation - deployments require manual triggers via CLI or web interface rather than automatic deployment on Git commits. Teams can work around this limitation by implementing CI/CD pipelines that call `ggt deploy` in response to Git events.

## Automation examples demonstrate real-world applications

Practical automation with Gadget typically involves combining the CLI with CI/CD tools. A **GitHub Actions workflow** might run tests with `ggt test` and deploy with `ggt deploy` upon successful merge to main. The CLI's exit codes and JSON output support scripting and error handling in automated pipelines.

For **complex deployment scenarios**, teams can use the platform's API to create custom automation. While Gadget doesn't expose a traditional management REST API, the GraphQL APIs can be used to programmatically manage application data and trigger actions. Combined with the CLI for deployment and configuration management, this provides sufficient flexibility for most automation needs.

## Conclusion

Gadget.dev provides **robust programmatic management capabilities** that meet or exceed those of traditional PaaS platforms, though with a different architectural approach. Its automatic API generation, comprehensive CLI tooling, and Shopify-specific features make it particularly compelling for Shopify app development. While it lacks traditional REST management APIs and infrastructure provisioning capabilities, its GraphQL-first approach and configuration-as-code patterns offer powerful alternatives that reduce complexity while maintaining flexibility. For teams building Shopify applications who value rapid development and automated API generation over infrastructure control, Gadget.dev presents a compelling programmatic management solution.