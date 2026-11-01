# Finora — Online Banking & Wealth Management System
## Complete Project Architecture, Technical Deep Dive & Comprehensive Viva Preparation Guide

---

## 1. Project Overview & Executive Summary

**Finora** is an enterprise-grade, production-ready Online Banking and Personal Finance Management platform designed to bridge consumer digital banking with intelligent wealth management.

The system is built as a decoupled, multi-tier web application consisting of:
- **Frontend**: A React 19 single-page application (SPA) powered by Vite 6 and Tailwind CSS.
- **Backend**: A resilient Python 3.12 / Django 5 REST Framework API server.
- **Database**: An enterprise MySQL 8+ relational database engine running on the InnoDB storage engine.

### The Problem It Solves
Traditional retail banking web portals merely display static lists of historical debit and credit transactions. They leave the burden of budget planning, expense categorisation, investment portfolio performance analysis, and financial health assessment to external spreadsheets or third-party apps.

Finora solves this by integrating:
1. **Real-time Banking Ledger**: Checking, savings, credit, and investment accounts with instant balance updates.
2. **Deterministic Monetary Precision**: Zero-loss financial arithmetic utilizing Python `Decimal`.
3. **Automated Budget Tracking**: Category-specific spending limits that trigger automated alerts at 80% and 100% capacity.
4. **Wealth Portfolio Management**: Multi-asset tracking (Stocks, Crypto, Mutual Funds, Real Estate, Gold) with calculated returns.
5. **Multi-Role RBAC**: Granular permissions separating **Customers**, **Financial Advisors**, and **Administrators**.
6. **Multi-Format Export Engine**: Server-side generation of downloadable financial reports in PDF, Excel (`.xlsx`), and CSV formats.

---

## 2. End-to-End System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (BROWSER)                          │
│   React 19 SPA (Vite 6)  •  Tailwind CSS  •  Recharts  •  Lucide Icons │
│   Custom Luxury Black & Gold Theme (#0B0B0A, #171714, #D4AF37)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         HTTP/1.1 REST Requests
                        JSON Payloads + Bearer JWT
                         (Axios with Interceptors)
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       TRANSPORT & SECURITY LAYER                       │
│    CORS Headers Middleware  •  SimpleJWT Auth  •  Token Refresh        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LOGIC LAYER                        │
│                     Django 5.1 REST Framework Backend                  │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  apps.users  │  │apps.accounts │  │apps.transact │  │apps.budgets│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │apps.invest   │  │  apps.goals  │  │apps.notificat│  │apps.analyt │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ apps.reports │  │  apps.audit  │  │apps.dashboard│                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       Object-Relational Mapping (ORM)
                       PyMySQL Connection (utf8mb4)
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE LAYER                          │
│                 MySQL 8.0+ Database (InnoDB Engine)                    │
│      ACID Transactions  •  Foreign Key Constraints  •  B-Tree Indexing  │
└────────────────────────────────────────────────────────────────────────┘
```

### Architectural Layer Responsibilities

| Layer | Technologies | Responsibilities |
| :--- | :--- | :--- |
| **Frontend (Client)** | React 19, Vite 6, Tailwind CSS, Recharts | Interactive UI, client-side route guards, live charts, quick-add modals, responsive navigation. |
| **API Transport** | Axios, SimpleJWT, CORS Headers | Stateless Bearer token injection, auto-refresh on 401 Unauthorized, cross-origin security. |
| **Backend API** | Python 3.12, Django 5.1, DRF | Business validation, Decimal arithmetic, signals, serializers, report generation. |
| **Database** | MySQL 8.0+ via PyMySQL / InnoDB | Relational integrity, foreign keys, cascade safety, atomic commits, unicode storage. |

---

## 3. Backend Engineering & Django Apps Breakdown

Finora organizes its code into 11 specialized Django apps under the `backend/apps/` package:

1. **`apps.users`**:
   - Implements a custom `User` model inheriting from `AbstractUser`.
   - Incorporates user roles: `CUSTOMER`, `FINANCIAL_ADVISOR`, and `ADMINISTRATOR`.
   - Supports email-based authentication and secure password encryption using PBKDF2 with SHA-256.

2. **`apps.accounts`**:
   - Manages checking, savings, credit, and investment accounts.
   - Enforces account number masking (e.g., `•••• •••• 4892`) in serializer representations to prevent sensitive data leakage.

3. **`apps.transactions`**:
   - Ledger of deposits, withdrawals, transfers, and bill payments.
   - Wraps balance updates in `@transaction.atomic` blocks to guarantee consistency during funds transfers.

4. **`apps.budgets`**:
   - Sets category-specific monthly spending caps.
   - Calculates real-time consumption and categorizes status into:
     - `SAFE` (< 80%)
     - `WARNING` (80% – 99%)
     - `EXCEEDED` (100%+)

5. **`apps.investments`**:
   - Tracks portfolio assets across Stocks, Crypto, Mutual Funds, Gold, and Real Estate.
   - Calculates purchase valuation, current market value, unrealized gain/loss, and percentage ROI.

6. **`apps.goals`**:
   - Savings targets (e.g., Emergency Fund, Vacation, New Car).
   - Computes real-time percentage completion and milestone deadlines.

7. **`apps.notifications`**:
   - Event-driven notifications powered by Django `post_save` signals.
   - Dispatches alerts when budgets enter `WARNING`/`EXCEEDED` thresholds or when large transactions execute.

8. **`apps.analytics`**:
   - Aggregates cash flow (income vs. expense), net worth growth over time, savings rates, and financial health scores (0–100 scale).

9. **`apps.reports`**:
   - Generates downloadable statements:
     - **PDF**: Built with `reportlab` with custom tables and styling.
     - **Excel**: Formatted spreadsheets built with `openpyxl`.
     - **CSV**: Native streamed comma-separated values.

10. **`apps.audit`**:
    - Immutable security audit log recording user logins, role modifications, and administrative operations.

11. **`apps.dashboard`**:
    - High-efficiency composite endpoint that bundles account balances, recent transactions, budget summaries, and alerts into a single round-trip HTTP response.

---

## 4. Frontend Architecture & Design System

- **Framework**: React 19 initialized with Vite 6 for instant compilation and Hot Module Replacement (HMR).
- **Design System**: Bespoke luxury "Black & Gold" aesthetic:
  - Deep Obsidian Canvas: `#0B0B0A`
  - Elevation Card Background: `#171714`
  - Metallic Gold Accent: `#D4AF37`
  - Soft Neutral Typography: `#F5F5F0` and muted secondary text.
- **Routing**: `react-router-dom` with role-aware route guards (`<ProtectedRoute>`, `<RoleRoute>`) that prevent customers from viewing advisor suites or admin consoles.
- **Data Visualization**: `recharts` for interactive Area timelines (cash flow trends) and Donut Pie charts (spending breakdowns).
- **Session Handling**: `AuthContext` provides global authentication state; an Axios interceptor catches expired JWT tokens and refreshes them transparently using the refresh token.

---

## 5. Security & Mathematical Integrity

1. **Arbitrary Precision Monetary Arithmetic**:
   Standard IEEE-754 floating-point numbers in programming languages introduce binary rounding errors (e.g., `0.1 + 0.2 = 0.30000000000000004`). Finora strictly enforces Python's `Decimal` type across all balance calculations, interest computations, and transaction processing.
2. **Tenant Privacy Isolation**:
   Every database query in customer endpoints is scoped strictly to `request.user` (e.g., `Account.objects.filter(user=request.user)`). Cross-tenant access is structurally impossible.
3. **ACID Transaction Guarantees**:
   Account transfers perform debit and credit legs within `django.db.transaction.atomic`. If either leg fails, the entire transaction is rolled back.
4. **Stateless JWT Security**:
   - Access tokens expire after 60 minutes.
   - Refresh tokens expire after 7 days and use rotation with blacklisting on logout.
5. **CORS Restrictions**:
   Cross-Origin requests are restricted exclusively to authorized frontend hosts (`http://localhost:5173`).

---

## 6. MySQL 8 Database & PyMySQL Integration

- **Engine**: MySQL 8+ with the InnoDB storage engine for foreign keys and crash recovery.
- **Collation**: `utf8mb4_unicode_ci` supporting full 4-byte Unicode characters, emojis, and international currency formats.
- **Connector**: Pure-Python `pymysql` driver enabled via `pymysql.install_as_MySQLdb()` in `backend/config/__init__.py`. This avoids native C-compiler installation hurdles on various operating systems while preserving full Django MySQL backend compatibility.

---

## 7. Comprehensive Viva Voce Questions & Answers (35 Q&As)

### Category A: General & Conceptual Questions

#### Q1: What is Finora, and what real-world problem does it solve?
> **Answer**: Finora is an Online Banking and Personal Finance Management system. Traditional banking portals only display past transaction histories; Finora combines day-to-day banking operations with financial intelligence: automated budget compliance, investment portfolio ROI calculations, goal progress tracking, and multi-role interfaces for customers, financial advisors, and administrators.

#### Q2: Who are the primary user personas of the system?
> **Answer**:
> 1. **Customer**: Tracks personal accounts, executes transactions, monitors budgets, investments, and savings goals.
> 2. **Financial Advisor**: Reviews assigned client portfolios, inspects analytics, and delivers strategic recommendations.
> 3. **Administrator**: Oversees system users, assigns roles, manages banking accounts, and inspects security audit logs.

#### Q3: What makes Finora an enterprise-grade project?
> **Answer**:
> - Relational MySQL database with ACID compliance.
> - High-precision Decimal monetary arithmetic (no floating-point errors).
> - Stateless JWT authentication with token rotation and blacklisting.
> - Event-driven notification dispatch using Django signals.
> - Multi-format reporting (PDF, Excel, CSV).
> - Strict tenant privacy isolation and account number masking.

#### Q4: Walk through the life cycle of a transaction creation request.
> **Answer**:
> 1. User submits the transaction form in the React frontend.
> 2. Axios attaches the JWT Bearer token and sends a POST request to `/api/transactions/`.
> 3. Backend verifies the token and user identity.
> 4. Serializer validates account ownership, sufficient balance, and input data.
> 5. Within an `@transaction.atomic` block, the transaction record is saved and the account balance is updated.
> 6. A `post_save` signal triggers budget recalculation; if thresholds are exceeded, an alert notification is created.
> 7. The database transaction commits, and a 201 Created JSON response updates the frontend UI.

#### Q5: What were the biggest technical challenges faced during development?
> **Answer**:
> 1. Preventing floating-point rounding errors in calculations, solved using Python `Decimal`.
> 2. Ensuring funds transfers are atomic, solved using Django's `@transaction.atomic`.
> 3. Managing silent token refresh in the SPA, solved using Axios response interceptors.
> 4. Running a pure-Python MySQL driver on macOS without C compilation errors, solved with `pymysql.install_as_MySQLdb()`.

---

### Category B: Backend & Django REST Framework Questions

#### Q6: Why choose Django and Django REST Framework (DRF)?
> **Answer**: Django offers a secure, "batteries-included" web framework with an ORM, automatic migrations, and built-in protection against SQL injection, CSRF, and XSS. DRF builds on this with serializers, viewsets, authentication classes, and OpenAPI generation.

#### Q7: How do Django migrations work?
> **Answer**: Migrations bridge Python model definitions and the relational database schema. Running `makemigrations` scans `models.py` and produces migration script files. Running `migrate` runs those SQL alterations against MySQL and records applied migrations in the `django_migrations` table.

#### Q8: Why did you customize the User model instead of using Django's default User?
> **Answer**: Django best practices recommend customizing the user model at project inception (`AUTH_USER_MODEL = 'users.User'`). It allows adding business-specific fields like `role` (CUSTOMER, FINANCIAL_ADVISOR, ADMINISTRATOR), phone numbers, and profile avatars directly into the authentication table without awkward one-to-one profile tables.

#### Q9: What are Django Signals, and how are they used in Finora?
> **Answer**: Signals allow decoupled applications to listen for model events. Finora attaches `post_save` signals to `Transaction` models in `apps.notifications.signals`. Whenever an expense is logged, the signal evaluates category budget limits and creates an in-app notification if spending exceeds 80% or 100%.

#### Q10: What is the significance of `@transaction.atomic` in financial operations?
> **Answer**: In financial systems, debiting one account and crediting another must be atomic. `@transaction.atomic` ensures that if any error occurs midway through an operation, all database modifications are rolled back, preventing orphaned debits or credits.

#### Q11: What dual purpose do DRF Serializers serve?
> **Answer**:
> 1. **Serialization**: Converting complex Django Model instances into Python dictionaries that can be rendered into JSON for HTTP GET responses.
> 2. **Deserialization & Validation**: Parsing incoming JSON payloads, validating data types and business rules, and converting them into validated Python objects ready for database persistence.

#### Q12: How are multi-format reports (PDF, Excel, CSV) generated?
> **Answer**:
> - **PDF**: Programmatically formatted using `reportlab`, generating tables, headers, and footers in a styled canvas.
> - **Excel (`.xlsx`)**: Generated via `openpyxl` with column styling and numeric formatting.
> - **CSV**: Streamed using Python's native `csv` module with `text/csv` MIME headers.

#### Q13: How is API documentation maintained?
> **Answer**: Through `drf-spectacular`, which automatically generates an OpenAPI 3.0 specification from code annotations and serializer schemas, accessible interactively via Swagger UI at `/api/docs/`.

---

### Category C: Database & MySQL Engineering Questions

#### Q14: Why choose MySQL over SQLite for Finora?
> **Answer**: SQLite is a file-based database that locks the entire file on writes, making it unsuitable for concurrent web access. MySQL 8+ provides robust client-server architecture, InnoDB row-level locking, high concurrency, strict foreign key constraints, and enterprise backup/restore capabilities.

#### Q15: How did you configure PyMySQL to work with Django?
> **Answer**: Django's MySQL engine defaults to the native `mysqlclient` C wrapper. In `backend/config/__init__.py`, we added:
> ```python
> import pymysql
> pymysql.install_as_MySQLdb()
> ```
> This patches Python's import system so Django uses `pymysql` transparently as `MySQLdb`.

#### Q16: Why did you choose `utf8mb4` encoding over standard `utf8`?
> **Answer**: In MySQL, standard `utf8` only stores up to 3 bytes per character, failing on 4-byte characters. `utf8mb4` fully supports 4-byte characters, ensuring compatibility with all global currency symbols, emojis in transaction descriptions, and international names.

#### Q17: How is database normalization implemented in this project?
> **Answer**: The database adheres to Third Normal Form (3NF):
> - User authentication attributes exist solely in `users_user`.
> - Account balances and numbers exist in `accounts_account`.
> - Transactions store foreign key references to accounts and categories rather than duplicating user or account details.

#### Q18: What is an index, and where is indexing applied?
> **Answer**: An index is a B-Tree data structure that accelerates search queries on a column. In Finora, indexes are created on `transactions.date`, `transactions.user_id`, `accounts.account_number`, and all foreign key relationships to maintain sub-millisecond query latency.

---

### Category D: Frontend & React Architecture Questions

#### Q19: Why React 19 + Vite instead of Create React App?
> **Answer**: Create React App is obsolete. Vite leverages native ES Modules (ESM) in modern browsers and `esbuild` for lightning-fast dev startup and Hot Module Replacement (HMR). React 19 provides optimized component rendering and modern React hooks.

#### Q20: How are client-side routes secured?
> **Answer**: Route guards (`<ProtectedRoute>` and `<RoleRoute>`) check the active session in `AuthContext`. If the user is unauthenticated or lacks the required role (e.g., a customer trying to access `/advisor`), they are redirected to `/login` or `/unauthorized`.

#### Q21: How does Axios handle silent token refresh?
> **Answer**: An Axios response interceptor intercepts any HTTP 401 Unauthorized response, pauses pending requests, sends the stored refresh token to `/api/auth/token/refresh/`, updates the access token in memory/storage, and automatically retries the original request.

#### Q22: Why Recharts for financial visualization?
> **Answer**: Recharts is built specifically for React, rendering declarative SVG elements. It supports smooth responsive animations, custom tooltips, gradients, and container auto-resizing.

#### Q23: How are monetary values formatted on the client?
> **Answer**: Through `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`. This guarantees standardized localization, thousand-separators, and two decimal places.

---

### Category E: Security, Authentication & DevOps Questions

#### Q24: What is the difference between Authentication and Authorization in Finora?
> **Answer**:
> - **Authentication**: Identifies the user ("Who are you?") via email, password, and JWT issuance.
> - **Authorization**: Enforces permissions ("What can you do?") via DRF permission classes such as `IsCustomer`, `IsFinancialAdvisor`, or `IsAdminUser`.

#### Q25: Why use JWT instead of traditional session cookies?
> **Answer**: JWTs are self-contained and stateless; the backend verifies the cryptographic signature without performing a database lookup on every single API request. This enables horizontal scaling and seamless API consumption by mobile apps or third-party services.

#### Q26: How are user passwords secured?
> **Answer**: Passwords are never stored in plaintext. Django uses the PBKDF2 algorithm with a SHA-256 hash and a unique salt per user across thousands of iterations, defending against rainbow tables and brute-force attacks.

#### Q27: How does Finora prevent SQL Injection?
> **Answer**: Finora uses Django's ORM, which automatically parameterizes all SQL queries. User input is never concatenated directly into SQL strings, rendering SQL injection impossible.

#### Q28: How does Finora protect against Cross-Site Scripting (XSS)?
> **Answer**: React automatically escapes all variables rendered inside JSX templates before injecting them into the DOM. On the backend, DRF serializers sanitize and validate incoming text fields.

#### Q29: What is the role of the Audit App?
> **Answer**: In financial banking regulations, maintaining an immutable audit log is mandatory. The `apps.audit` module records timestamps, IP addresses, user IDs, and descriptions for sensitive actions (e.g., privilege changes, large transfers).

#### Q30: How would you deploy Finora in production?
> **Answer**:
> 1. **Frontend**: Built via `npm run build` and served as optimized static assets via Nginx or a CDN (Cloudflare / AWS S3 + CloudFront).
> 2. **Backend**: Run with Gunicorn or Uvicorn behind an Nginx reverse proxy that handles SSL termination.
> 3. **Database**: Hosted on a managed MySQL service (AWS RDS / DigitalOcean) with automated snapshots, read replicas, and SSL enforcement.

#### Q31: What is CORS, and why is it configured?
> **Answer**: Cross-Origin Resource Sharing is a browser security mechanism that blocks scripts from making requests across different origins. Since React runs on port 5173 and Django runs on port 8000, we explicitly whitelist `http://localhost:5173` in Django's CORS settings.

#### Q32: What happens if a customer attempts to query another customer's balance?
> **Answer**: The query returns HTTP 404 or 403. Every database query in customer views filters by `user=request.user`. Even if a user manually modifies an account ID in an API request, Django finds zero matching records in their partition.

#### Q33: How does the Financial Health Score work?
> **Answer**: It calculates a 0–100 score based on four weighted components:
> 1. **Savings Rate (30%)**: Proportion of income saved.
> 2. **Budget Discipline (30%)**: Penalties for categories that exceed limits.
> 3. **Liquid Emergency Buffer (20%)**: Months of recurring expenses covered by cash balances.
> 4. **Investment Diversification (20%)**: Spread across asset classes.

#### Q34: How are secrets and environment variables secured?
> **Answer**: Sensitive parameters (`SECRET_KEY`, `DB_PASSWORD`, JWT secrets) are loaded via `python-dotenv` from a `.env` file that is excluded from version control via `.gitignore`.

#### Q35: What future enhancements are planned for Finora?
> **Answer**:
> 1. Integration with Open Banking APIs (e.g., Plaid) for automated live bank sync.
> 2. Two-Factor Authentication (2FA) via TOTP / Google Authenticator.
> 3. WebSocket push notifications using Django Channels.
> 4. AI-driven financial advisory powered by Large Language Models for automated spending recommendations.

---

## 8. Summary Quick-Reference Card

| Component | Technical Implementation |
| :--- | :--- |
| **System Name** | Finora (Online Banking & Personal Finance Platform) |
| **Architecture** | Decoupled SPA + REST API + Relational Database |
| **Frontend** | React 19, Vite 6, Tailwind CSS, Recharts, Lucide React |
| **Backend** | Python 3.12, Django 5.1, Django REST Framework 3.15+ |
| **Database** | MySQL 8.0+ (InnoDB Engine, utf8mb4 collation) |
| **DB Connector** | PyMySQL (`pymysql.install_as_MySQLdb()`) |
| **Authentication** | JWT (SimpleJWT) Bearer tokens with rotation & blacklisting |
| **Monetary Math** | Python `Decimal` module (zero floating-point inaccuracy) |
| **API Docs** | OpenAPI 3.0 / Swagger UI generated via `drf-spectacular` |
| **Reports** | ReportLab (PDF), OpenPyXL (Excel), Python CSV |
| **Security** | PBKDF2 hashing, `@transaction.atomic`, CORS, masked account numbers |

