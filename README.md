# NexusEMS — Enterprise Employee Management System

A full-stack, enterprise-grade **Employee Management System (EMS)** designed for modern corporate human resources, workforce administration, payroll processing, and attendance analytics.

Built with high reliability, role-based access control (RBAC), and responsive SaaS user experience.

---

## 🌟 Key Highlights & Features

- **Executive Analytics Dashboard**: Real-time workforce metrics, Recharts visual analytics (department distribution, recruitment velocity, employee statuses), upcoming birthdays, and anniversary notifications.
- **Role-Based Access Control (RBAC)**:
  - 👑 **Super Admin**: Complete enterprise administration, user privilege management, system audit logs.
  - 👔 **HR Manager**: Manage employees, departments, leave approvals, payroll, attendance records, and evaluations.
  - 👤 **Employee**: Self-service portal for clock-in/out, leave applications, downloadable payslips, documents, and personal profile.
- **Employee Lifecycle Directory**:
  - Full CRUD operations with auto-generated unique Employee IDs (`EMP-XXXXXX`).
  - Search by keyword, multi-field filters (Department, Designation, Employment Status).
  - Export full directory to CSV.
  - Multi-tab detailed profiles (Personal, Professional, Sensitive Compensation & Banking).
- **Time & Attendance Tracking**:
  - Daily one-click check-in and check-out with automatic working hours computation.
  - Automatic late arrival and early departure detection.
  - Monthly attendance summaries and departmental CSV reporting.
- **Leave Management Workflow**:
  - Support for Casual, Sick, Earned, Paid, Unpaid, and Other leave categories.
  - Real-time balance deductions upon manager approval.
  - Employee cancellation of pending requests.
- **Payroll & Digital Payslips**:
  - Automated salary structure computation: Basic + Allowances (HRA, Transport, Medical, Special) + Bonuses - Statutory Deductions (PF, ESI, Tax).
  - Official printable/downloadable monthly digital payslips.
- **Performance Appraisals**:
  - 5-Star competency ratings across Productivity, Quality, Communication, Teamwork, Initiative, and Punctuality.
  - Goal setting, manager feedback, and appraisal logs.
- **Secure Document Vault**:
  - Categorized employee document storage (Resumes, Offer Letters, KYC IDs, Certifications).
  - Authenticated file downloads preventing unauthorized public access.
- **Visual Design**:
  - Built with Tailwind CSS, dark & light mode toggles, Lucide React icons, and mobile responsiveness.

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Recharts, Lucide React, React Hot Toast |
| **Backend** | Node.js, Express.js, JWT, bcrypt.js, Multer, Helmet, Mongo-Sanitize, Express Rate Limit, Morgan |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Hosting** | Render Free Web Service (Backend) & Render Static Site (Frontend) |

---

## 📁 Repository Structure

```
employee-management-system/
├── backend/
│   ├── config/             # Database & Multer storage configuration
│   ├── controllers/        # REST API controllers
│   ├── middleware/         # JWT verification, Role authorization, Error handler
│   ├── models/             # Mongoose schemas (User, Employee, Dept, Attendance, Leave, Payroll, etc.)
│   ├── routes/             # Express API routes
│   ├── uploads/            # Secure document and avatar storage
│   ├── utils/              # Database seeder utility
│   ├── .env.example        # Backend environment template
│   ├── server.js           # API entrypoint
│   └── package.json
├── frontend/
│   ├── public/             # Static assets & _redirects for SPA routing
│   ├── src/
│   │   ├── components/     # Modals, Navbar, Sidebar, Badges, Pagination, Spinners
│   │   ├── context/        # AuthContext and ThemeContext
│   │   ├── layouts/        # DashboardLayout wrapper
│   │   ├── pages/          # Auth, Dashboard, Employees, Attendance, Leaves, Payroll, etc.
│   │   ├── services/       # Axios API client with interceptors
│   │   ├── App.jsx         # Router & Route guards
│   │   ├── main.jsx        # App root
│   │   └── index.css       # Tailwind directives & design system utilities
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── package.json            # Root workspace scripts
└── README.md
```

---

## ⚡ Quick Start (Local Setup)

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas database connection string or local MongoDB instance

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
```
Fill in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ems?retryWrites=true&w=majority
JWT_SECRET=super_secure_jwt_secret_key_minimum_32_characters
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed Initial Demo Accounts
```bash
npm run seed
```
This initializes the database with standard departments and pre-configured test accounts:
- **Super Admin**: `admin@ems.com` / `Admin@123456`
- **HR Manager**: `hr@ems.com` / `Hr@123456`
- **Employee**: `employee@ems.com` / `Emp@123456`

### 4. Start Development Servers
From the root directory:
```bash
# Terminal 1: Backend API
npm run dev:backend

# Terminal 2: Frontend Client
npm run dev:frontend
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public |
| `GET` | `/api/auth/me` | Fetch active user session | Authenticated |
| `PUT` | `/api/auth/profile` | Update profile information | Authenticated |
| `PUT` | `/api/auth/change-password` | Update account password | Authenticated |
| `GET` | `/api/auth/users` | List all system user credentials | Super Admin |
| `PUT` | `/api/auth/users/:id/role` | Modify user role | Super Admin |
| `PUT` | `/api/auth/users/:id/toggle` | Deactivate/activate user | Super Admin |

### Employees (`/api/employees`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | Search, filter, and paginate employees | Authenticated |
| `GET` | `/api/employees/stats` | Aggregate dashboard statistics | HR / Admin |
| `GET` | `/api/employees/export` | Download complete directory as CSV | HR / Admin |
| `GET` | `/api/employees/:id` | Fetch employee profile | Authenticated |
| `POST` | `/api/employees` | Create employee record | HR / Admin |
| `PUT` | `/api/employees/:id` | Update employee information | HR / Admin |
| `DELETE` | `/api/employees/:id` | Remove employee and deactivate login | Super Admin |

### Departments (`/api/departments`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | List departments with head & count | Authenticated |
| `GET` | `/api/departments/:id` | Department details and assigned staff | Authenticated |
| `POST` | `/api/departments` | Create new department | HR / Admin |
| `PUT` | `/api/departments/:id` | Update department details | HR / Admin |
| `DELETE` | `/api/departments/:id` | Delete department (with staff check) | Super Admin |

### Attendance (`/api/attendance`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/checkin` | Check in for the day | Authenticated |
| `POST` | `/api/attendance/checkout` | Check out and compute working hours | Authenticated |
| `GET` | `/api/attendance` | Attendance log history | Authenticated |
| `GET` | `/api/attendance/monthly-report`| Monthly aggregated staff attendance | HR / Admin |
| `POST` | `/api/attendance/absent` | Manual absent assignment | HR / Admin |

### Leaves (`/api/leaves`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leaves` | Submit a leave request | Authenticated |
| `GET` | `/api/leaves` | List leave applications with filters | Authenticated |
| `GET` | `/api/leaves/balance/:empId` | Check available leave balances | Authenticated |
| `PUT` | `/api/leaves/:id/status` | Approve or reject leave request | HR / Admin |
| `PUT` | `/api/leaves/:id/cancel` | Cancel pending request | Authenticated |

### Payroll (`/api/payroll`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payroll` | Fetch salary history & payslips | Authenticated |
| `GET` | `/api/payroll/summary` | Aggregate monthly payroll disbursement | HR / Admin |
| `POST` | `/api/payroll` | Create salary ledger record | HR / Admin |
| `PUT` | `/api/payroll/:id` | Update payment status or amount | HR / Admin |
| `DELETE` | `/api/payroll/:id` | Delete payroll entry | Super Admin |

### Documents & Performance (`/api/documents`, `/api/performance`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/documents` | List categorized employee files | Authenticated |
| `POST` | `/api/documents` | Upload file (resume, ID, contract) | Authenticated |
| `GET` | `/api/documents/:id/download` | Secure authorized download | Authenticated |
| `GET` | `/api/performance` | List appraisals and KPI evaluations | Authenticated |
| `POST` | `/api/performance` | Record manager performance review | HR / Admin |

---

## 🚀 Free Tier Render Deployment Guide

### A. Deploy Backend (Render Web Service - Free)
1. In the Render Dashboard, click **New +** > **Web Service**.
2. Connect your GitHub repository: `employee-management-system`.
3. Configure the service settings:
   - **Name**: `nexus-ems-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<A strong 32+ character random secret>`
   - `JWT_EXPIRE`: `7d`
   - `FRONTEND_URL`: `https://nexus-ems.onrender.com` *(Update with your static site domain)*
5. Click **Create Web Service**. Note the assigned backend URL (e.g. `https://nexus-ems-backend.onrender.com`).

### B. Deploy Frontend (Render Static Site - Free)
1. In the Render Dashboard, click **New +** > **Static Site**.
2. Connect the same repository.
3. Configure settings:
   - **Name**: `nexus-ems`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://nexus-ems-backend.onrender.com` *(Your live backend URL)*
5. Note: SPA routing is pre-configured via `frontend/public/_redirects` (`/*  /index.html  200`).
6. Click **Create Static Site**.

---

## 🛡️ Security Best Practices Implemented
- Passwords hashed using `bcryptjs` with salt factor 12.
- JWT stored in HTTP client with automatic expiration handling.
- HTTP security headers with `helmet`.
- Request rate-limiting to prevent brute force attacks.
- Input sanitization against MongoDB query injection via `express-mongo-sanitize`.
- Restricted CORS configuration.
- Files uploaded through strict MIME whitelist and size boundaries.

