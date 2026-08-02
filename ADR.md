# ADR

# 1. Architectural Decisions

* 1.1 Security: RBAC at both frontend and backend
* 1.2 Backend
  * 1.2.1 Tech Stack
    * 1.2.1.1 Language: TypeScript
    * 1.2.1.2 Framework and External Services:
      * 1.2.1.2.1 App: Express
      * 1.2.1.2.2 Network: Axios
      * 1.2.1.2.3 Database: mysql2
      * 1.2.1.2.4 ORM: Sequelize
      * 1.2.1.2.5 Logging: Winston
      * 1.2.1.2.6 CORS: cors
      * 1.2.1.2.7 Env: dotenv
      * 1.2.1.2.8 Validation: Zod
    * 1.2.1.3 Entry point: index.ts
    * 1.2.1.4 Component Architecture: Modular Monolith Layered Architecture
    * 1.2.1.5 Request Library: Axios
    * 1.2.1.6 Multimedia File Handling: Cloudinary
    * 1.2.1.7 Payments: null
  * 1.2.2 Config
    * 1.2.2.1 Env Variables
    * 1.2.2.2 Database
* 1.3 Frontend
  * 1.3.1 SPA Progressive Web Application
  * 1.3.2 Tech Stack
  * 1.3.3 Frameworks and External Services:
    * 1.3.3.1 Application: Next.js (React)
    * 1.3.3.2 Styling: Tailwind CSS
    * 1.3.3.3 Icons: lucide-react
    * 1.3.3.4 Query: TanStack Query
    * 1.3.3.5 Network requests: Axios
    * 1.3.3.6 Multimedia File Handling: Cloudinary
    * 1.3.3.7 Payments: Raenest
  * 1.3.4 Config
    * 1.3.4.1 Axios with refreshToken API
    * 1.3.4.2 AuthContext and AuthProvider
    * 1.3.4.3 Env Variables
  * 1.3.5 Component Architecture: Pages → Components

# 2. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Next.js App (TypeScript)                               │   │
│  │  - TanStack Query (Caching)                             │   │
│  │  - Axios (HTTP)                                         │   │
│  │  - Tailwind CSS (Styling)                               │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │ HTTPS                                   │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express API Server                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Middleware Layer                                        │   │
│  │  - CORS                                                 │   │
│  │  - Rate Limiting (100 req/min)                          │   │
│  │  - JWT Authentication                                   │   │
│  │  - Request Logging (Winston)                            │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                         │
│  ┌────────────────────┴────────────────────────────────────┐   │
│  │  Route Handlers (TypeScript)                            │   │
│  └────────────────────┬────────────────────────────────────┘   │
│                       │                                         │
│  ┌────────────────────┴────────────────────────────────────┐   │
│  │  Service Layer (Business Logic)                         │   │
│  └────────────────────┬────────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────────┐┌───────────────┐┌───────────────┐
│   MySQL       ││  Cloudinary   ││  External     │
│   Database    ││  (Media)      ││  APIs         │
└───────────────┘└───────────────┘└───────────────┘
```

# 3. Code Standards

* 3.1 Frontend
  * 3.1.1 Annotate each page with the specification stepId it fulfills.
  * 3.1.2 Centralised Brand Assets:
    * 3.1.2.1 Logo
    * 3.1.2.2 Favicon
    * 3.1.2.3 Name
    * 3.1.2.4 Contact email
    * 3.1.2.5 Phone
* 3.2 Backend
  * 3.2.1 Centralised Error Handling
  * 3.2.2 Annotate each controller with the specification stepId it fulfills.
  * 3.2.3 Centralise Email Body formatted string files.
* 3.3 General
  * 3.3.1 No string literals in the code — use constants files for routes, query keys, error codes, and messages.
