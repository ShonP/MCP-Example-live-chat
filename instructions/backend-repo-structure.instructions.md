---
applyTo: "backend/**"
---
# This is the repo structure for the backend service:

## Core Principles
- **Infrastructure Layer**: Generic, reusable database/storage services (no domain logic)
- **Repository Pattern**: Base repositories in infrastructure, domain-specific repositories in modules
- **Separation of Concerns**: Database details isolated from business logic
- **Single Responsibility**: Each module owns its repositories, services, and controllers
- **Domain Isolation**: Each domain (app) is self-contained with its own subscriptions, user context, and features
- **No Global State**: Domain-specific data uses domain-prefixed partition keys for isolation

## Directory Structure

```
src/
  main.ts
  app.module.ts

  config/
    config.module.ts
    configuration.ts
    validation.ts

  core/
    exceptions/
      global-exception.filter.ts
    middleware/
      request-id.middleware.ts
      correlation-id.middleware.ts
    interceptors/
      logging.interceptor.ts
      timeout.interceptor.ts
      response.interceptor.ts
    pipes/
      validation.pipe.ts
    decorators/
      current-user.decorator.ts
      track-usage.decorator.ts
      limit-usage.decorator.ts
    guards/
      jwt-auth.guard.ts
      auth0-webhook.guard.ts
      rbac.guard.ts

  common/
    dto/
    utils/
      ulid.util.ts
      date.util.ts
    constants/
    types/
    interfaces/
      base-entity.interface.ts
      base-repository.interface.ts

  infrastructure/
    database/
      cosmos/
        cosmos.module.ts
        services/
          cosmos.service.ts                  # Generic Cosmos DB wrapper
          cosmos-health.service.ts           # Health check for Cosmos
        repositories/
          base.repository.ts                 # Generic base repository for Cosmos
        interfaces/
          config.interface.ts                # Cosmos configuration
          cosmos.interface.ts                # Cosmos repository interface
        types/
          base-entity.types.ts               # Base entity types for Cosmos

      storage/
        storage.module.ts
        services/
          table-storage.service.ts           # Generic Table Storage wrapper
          table-storage-health.service.ts    # Health check for Table Storage
          storage.service.ts                 # Blob Storage wrapper
          storage-health.service.ts          # Health check for Blob Storage
        repositories/
          base-table.repository.ts           # Generic base repository for Table Storage
          base.repository.ts                 # Generic base repository for Blob Storage
        interfaces/
          config.interface.ts                # Storage configuration
          table.interface.ts                 # Table Storage interface
          storage.interface.ts               # Blob Storage interface
        types/
          table-entity.types.ts              # Base table entity types
          storage-entity.types.ts            # Base storage entity types

    secrets/
      keyvault/
        keyvault.module.ts
        services/
          keyvault.service.ts                # Azure Key Vault wrapper
          keyvault-health.service.ts         # Health check for Key Vault
        interfaces/
          config.interface.ts                # Key Vault configuration
          keyvault.interface.ts              # Key Vault interface

    http/
      http.module.ts
      http.service.ts
      interfaces/
        http.interface.ts

  modules/
    auth/
      auth.module.ts
      auth.controller.ts                     # Only /sync endpoint, no /me
      auth.service.ts
      interfaces/
        auth.interface.ts
        user.interface.ts
        provider.interface.ts
      dto/
        sync-user.dto.ts
      repositories/
        user.repository.ts                   # extends BaseTableRepository
        provider.repository.ts               # extends BaseTableRepository
        provider-lookup.repository.ts        # extends BaseTableRepository
        email-lookup.repository.ts           # extends BaseTableRepository

    subscriptions/                           # Shared subscription infrastructure only
      subscriptions.module.ts                # Exports shared services only
      base/
        base-subscription.service.ts         # Common subscription logic
        base-subscription.repository.ts      # Base repo with domain prefix handling
        base-webhook.service.ts              # Common webhook logic
      services/
        stripe.service.ts                    # Shared Stripe API wrapper
        webhook-router.service.ts            # Routes webhooks to domain handlers
      controllers/
        webhooks.controller.ts               # Global webhook endpoint
      interfaces/
        subscription.interface.ts            # Base subscription interfaces
        webhook-router.interface.ts          # Webhook routing interfaces

    real-estate/                             # Domain: Real Estate App
      real-estate.module.ts
      controllers/
        real-estate.controller.ts            # Main domain endpoints
        user.controller.ts                   # GET /real-estate/me
        subscription.controller.ts           # /real-estate/subscriptions/*
      services/
        real-estate.service.ts               # Domain business logic
        user.service.ts                      # Domain user context
        subscription.service.ts              # Domain subscription management
        webhook.service.ts                   # Domain webhook handler
      interfaces/
        property.interface.ts
        zillow.interface.ts
        rentcast.interface.ts
        subscription.interface.ts            # Domain subscription types
        user-context.interface.ts            # Domain user context
      dto/
        property-valuation.dto.ts
        property-report.dto.ts
        zillow-property.dto.ts
        subscription.dto.ts                  # Domain subscription DTOs
        user-context.dto.ts                  # Domain user context DTO
      entities/
        property-valuation.entity.ts
        property-report.entity.ts
        zillow-property.entity.ts
      repositories/
        zillow.repository.ts                 # Interface for Zillow
        rentcast.repository.ts               # Interface for RentCast
        subscription.repository.ts           # PK: real-estate#{userId}
        subscription-lookup.repository.ts    # Domain subscription lookup
        product.repository.ts                # PK: real-estate#PRODUCT
        invoice.repository.ts                # PK: real-estate#{userId}
      data/
        zillow.repository.impl.ts            # Implementation using HttpService
        rentcast.repository.impl.ts          # Implementation using HttpService

    usage/
      usage.module.ts
      usage.controller.ts
      usage.service.ts
      interfaces/
        usage.interface.ts
      dto/
        usage-stats.dto.ts
      repositories/
        usage-tracking.repository.ts         # extends BaseTableRepository

  telemetry/
    logger/
      logger.module.ts
      logger.service.ts
      interfaces/
        logger.interface.ts
    tracing/
      tracing.module.ts
      tracing.provider.ts

  health/
    health.module.ts
    health.controller.ts

test/
  unit/
  e2e/

docker/
  docker-compose.yml

scripts/
  seed.ts
  migrate.ts
```

## Key Patterns

### Cosmos DB Base Repository (Infrastructure Layer)
Located in `infrastructure/database/cosmos/repositories/base.repository.ts`
- Generic CRUD operations for document-based storage
- Query by partition key and SQL queries
- Handles retry logic and error handling
- Used for complex data requiring relationships and flexible schemas

### Table Storage Base Repository (Infrastructure Layer)
Located in `infrastructure/database/storage/repositories/base-table.repository.ts`
- Generic CRUD operations for key-value storage
- Query by partition key with OData filters
- Fast O(1) lookups with proper partition/row key design
- Used for simple entities requiring fast access

### Domain Repositories (Module Layer)
Located in `modules/{domain}/repositories/`
- Extend BaseTableRepository or BaseRepository (Cosmos)
- Implement domain-specific queries
- Own table/container names and mappings
- No cross-module dependencies

### Storage Strategy
Using hybrid approach based on data characteristics:

**Azure Table Storage** (for simple key-value entities):
- `users` (PK: 'USER', RK: userId)
- `providers` (PK: userId, RK: providerId)
- `providerlookup` (PK: providerId, RK: providerId)
- `emaillookup` (PK: email, RK: email)
- `usagetracking` (PK: userId_endpoint, RK: ulid)
- `subscriptions` (PK: {domain}#{userId}, RK: subscriptionId)
- `subscriptionlookup` (PK: stripeSubscriptionId, RK: stripeSubscriptionId, domain field)
- `products` (PK: {domain}#PRODUCT, RK: productId)
- `invoices` (PK: {domain}#{userId}, RK: invoiceId)

**Azure Cosmos DB** (for complex documents - future use):
- Complex relationships
- Flexible schemas
- Cross-partition queries
- Transaction support

### Domain Architecture

**Each domain is completely isolated:**
- Has its own subscription management
- Has its own user context endpoint (`/{domain}/me`)
- Has its own webhook handler
- Uses domain-prefixed partition keys for data isolation
- Products in Stripe have `domain` metadata

**Shared Infrastructure:**
- Stripe API wrapper (global)
- Webhook signature verification (global)
- Webhook router (routes to domain handlers)
- Base subscription services (optional reusable logic)

**Example Domain Structure (Real Estate):**
```
/api/v1/real-estate/me                          # User context
/api/v1/real-estate/subscriptions               # List subscriptions
/api/v1/real-estate/subscriptions/active        # Active subscription
/api/v1/real-estate/subscriptions/products      # Available products
/api/v1/real-estate/subscriptions/checkout      # Create checkout
/api/v1/real-estate/subscriptions/:id           # Cancel subscription
```

### Authentication Flow
1. User logs in via Auth0
2. Auth0 Post-Login Action calls `POST /api/v1/auth/sync`
3. Backend syncs user (create/link/update)
4. Auth0 adds internal userId to JWT
5. All subsequent requests use userId from JWT
6. Domain endpoints query by `{domain}#{userId}` for data access

**Azure Table Storage** (for simple key-value entities):
- `users` (PK: 'USER', RK: userId)
- `providers` (PK: userId, RK: providerId)
- `providerlookup` (PK: providerId, RK: providerId)
- `emaillookup` (PK: email, RK: email)
- `usagetracking` (PK: userId_endpoint, RK: ulid)

**Azure Cosmos DB** (for complex documents - future use):
- Complex relationships
- Flexible schemas
- Cross-partition queries
- Transaction support

### Authentication Flow
1. User logs in via Auth0
2. Auth0 Post-Login Action calls `POST /api/v1/auth/sync`
3. Backend syncs user (create/link/update)
4. Auth0 adds internal userId to JWT
5. All subsequent requests use userId from JWT
6. Other modules query by userId for data access
