# Finora — Online Banking & Personal Finance Management Dashboard

Finora is a production-ready, full-stack Online Banking and Personal Finance Management application built with a **React (Vite) Frontend** and a **Django REST Framework Backend**, backed by a **MySQL 8+ Database**.

It features role-based access control (**Customer**, **Financial Advisor**, **Administrator**), real-time financial calculations, budget adherence tracking, investment portfolio analytics, multi-format report exports (PDF, CSV, Excel), and interactive OpenAPI/Swagger documentation.

---

## 🌟 Key Features

- **Role-Based Authorization & Security**:
  - `CUSTOMER`: Manage own accounts, transactions, budgets, investments, goals, analytics, reports & notifications.
  - `FINANCIAL_ADVISOR`: Review assigned client portfolios, view client analytics, issue strategic recommendations.
  - `ADMINISTRATOR`: Manage system users, role assignments, accounts, transactions & view security audit logs.
  - Strict privacy layer ensuring customers can **NEVER** view another user's financial data.
  - Sensitive account numbers are auto-masked (`•••• •••• 4892`).
- **Financial Calculations Engine**:
  - High-precision monetary calculations using Python `Decimal`.
  - Automated liquid balance calculation, monthly cash flow (income vs expense), savings rate, net worth calculation, budget usage percentage & financial health scoring (0-100).
- **Interactive Dashboards & Analytics**:
  - Recharts cash flow area timeline, category spending donut breakdown, net worth growth curves.
  - Interactive date range filters (`1M`, `3M`, `6M`, `1Y`, `ALL`).
- **Multi-Format Financial Reporting**:
  - Downloadable PDF, Excel (`.xlsx`), and CSV reports for Monthly Financials, Expenses, Budgets, and Investments.
- **Black + Gold Design System**:
  - Dark mode aesthetic (`#0B0B0A` primary, `#171714` cards, `#D4AF37` metallic gold accent).

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS + Custom Black & Gold Design System
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios with JWT Interceptors & Auto Token Refresh

### Backend
- **Language & Framework**: Python 3.12 + Django 5 + Django REST Framework
- **Authentication**: Simple JWT (Bearer Access & Refresh Tokens) + PBKDF2 Password Hashing
- **Database**: MySQL 8+ (via PyMySQL / mysqlclient)
- **API Documentation**: OpenAPI 3.0 / Swagger UI via `drf-spectacular`
- **Report Generation**: ReportLab (PDF) + OpenPyXL (Excel) + CSV

---

## 📁 Project Structure

```text
finora/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── apps/
│       ├── users/         # Custom User model, JWT authentication, roles & permissions
│       ├── accounts/      # Bank Account model & masked account logic
│       ├── transactions/  # Transaction ledger, filterset & balance hooks
│       ├── budgets/       # Budget limits & status calculation (SAFE/WARNING/EXCEEDED)
│       ├── investments/   # Multi-asset portfolio management & return calculation
│       ├── goals/         # Target milestones & progress percentage
│       ├── notifications/ # Real-time alert notifications
│       ├── reports/       # PDF, CSV, Excel report exporters
│       ├── analytics/     # Cash flow & Net Worth analytics utilities
│       ├── dashboard/     # Consolidated dashboard API endpoint
│       └── audit/         # Administrator security audit logs
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/    # Reusable UI elements (Sidebar, Header, MobileNav, QuickAddModal)
│       ├── context/       # AuthContext for session management
│       ├── layouts/       # AppLayout & AuthLayout
│       ├── pages/         # Dashboard, Accounts, Transactions, Budgets, Investments, etc.
│       ├── routes/        # Protected & Role-based routes
│       ├── services/      # Axios REST service API layer
│       └── utils/         # Currency & Date formatters
│
├── README.md
└── .gitignore
```

---

## ⚙️ Quick Start Setup Instructions

### 1. Database Configuration (MySQL 8+)

Create a MySQL database:

```sql
CREATE DATABASE finora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Configure backend environment variables in `finora/backend/.env`:

```env
SECRET_KEY=django-insecure-finora-super-secret-key-change-in-production-2026
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=finora_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_PORT=3306

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

### 2. Backend Installation & Seed Demo Data

Navigate to the `backend/` directory:

```bash
cd backend

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations users accounts transactions budgets investments goals notifications audit analytics dashboard reports
python manage.py migrate

# Seed realistic demo data
python manage.py seed_demo_data

# Start backend server
python manage.py runserver
```

The Django REST backend will be running at `http://127.0.0.1:8000/`.

---

### 3. Demo Credentials

After running `python manage.py seed_demo_data`, use these logins:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `customer@finora.com` | `Password123!` |
| **Financial Advisor** | `advisor@finora.com` | `Password123!` |
| **Administrator** | `admin@finora.com` | `Password123!` |

---

### 4. Frontend Setup & Execution

Open a new terminal tab and navigate to `frontend/`:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

The React frontend will run at `http://localhost:5173/`.

---

## 📖 Interactive API Documentation

Interactive Swagger/OpenAPI documentation is available at:
- **Swagger UI**: `http://127.0.0.1:8000/api/docs/`
- **ReDoc**: `http://127.0.0.1:8000/api/redoc/`
- **OpenAPI Schema**: `http://127.0.0.1:8000/api/schema/`

---

## 🧪 Running Backend Unit Tests

Run the test suite covering models, serializers, financial calculation utilities, role permissions, and API endpoints:

```bash
cd backend
python manage.py test apps.users.tests apps.analytics.tests
```

---

## 🛡 Security & Best Practices

1. **Password Hashing**: Uses Django's default PBKDF2 algorithm with HMAC-SHA256.
2. **JWT Token Expiry**: Short-lived access tokens with rotating refresh token blacklisting.
3. **Monetary Precision**: All monetary fields use `DecimalField(max_digits=14, decimal_places=2)`.
4. **Data Isolation**: Querysets are strictly scoped to `request.user` to prevent unauthorized cross-customer data leakage.
5. **Sensitive Masking**: Account numbers are stored securely and exposed only as masked strings (`•••• •••• 4892`).
