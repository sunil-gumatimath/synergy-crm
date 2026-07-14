<div align="center">
  <h1>Synergy EMS</h1>
  <p><strong>A Modern Employee Management System & Internal Operations Platform</strong></p>
  
  [![React](https://img.shields.io/badge/React-19-blue.svg?style=flat&logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![Bun](https://img.shields.io/badge/Bun-Runtime-000000.svg?style=flat&logo=bun)](https://bun.sh/)
  [![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen.svg?style=flat)]()

  <br />

  [**View Live Demo**](https://synergy-emp-crm.vercel.app/) • 
  [**Report a Bug**](#-issues) • 
  [**Request a Feature**](#-contributing)
</div>

<hr />

## About the Project

**Synergy EMS** is a full-featured, high-performance employee management platform designed for growing teams. Instead of relying on fragmented tools for HR, tasks, and communication, Synergy consolidates everything into a fast, single-page application (SPA).

Built with **React 19** and powered by **Supabase** (PostgreSQL + Realtime + Auth), it delivers a seamless, role-based dashboard experience that empowers employees, managers, and administrators alike.

### Key Features

- **Comprehensive HR Management**: Complete workflows for employee profiles, secure onboarding documents, and administrative notes.
- **Role-Based Access Control (RBAC)**: Distinct interfaces and permissions for `Admin`, `Manager`, and `Employee` roles.
- **Time & Attendance Tracking**: Streamlined leave management (requests, approvals), daily time tracking, and an integrated organizational calendar.
- **Productivity & Execution**: Kanban-style task boards with drag-and-drop (`@hello-pangea/dnd`), support ticketing, and structured performance reviews.
- **Real-Time Collaboration**: Instant team chat and presence indicators powered by Supabase Realtime functionalities.
- **Advanced Analytics & Reporting**: Interactive data visualization using `Recharts` to monitor team performance and bandwidth.
- **Production-Ready & Highly Performant**: Vite-powered builds, Tailwind CSS 4 styling, complete Docker + Nginx containerization, and PWA (Progressive Web App) support.

---

## Tech Stack

| Category | Technology |
| --- | --- |
| **Frontend Framework** | React 19, React Router 7 |
| **Styling & UI** | Tailwind CSS 4, Lucide React, React Icons |
| **Build Tool & Runtime** | Vite 6, Bun |
| **Backend & Database** | Supabase (PostgreSQL, Auth, Realtime) |
| **Data Visualization** | Recharts |
| **Deployment** | Docker (Multi-stage build), Nginx |

---

## Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

- **[Bun](https://bun.sh/)**: This repository strictly enforces Bun as the package manager and runtime.
- **[Docker](https://www.docker.com/)** (Optional): For running the production-ready containerized setup.
- **[Supabase](https://supabase.com/)**: A Supabase project for your backend infrastructure.

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/synergy.git
cd synergy
bun install
```

### 2. Environment Configuration

Copy the example environment file and configure your local variables:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# Linux/macOS
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Initialization

Depending on your use case, choose one of the following methods to initialize your Supabase PostgreSQL instance:

<details>
<summary><b>Option A: Migration-Driven Setup (Recommended)</b></summary>
<br>

Apply the migrations in order via the Supabase CLI (`supabase db push` / `supabase migration up`) or paste each into the Supabase SQL Editor. This is the authoritative, version-controlled schema — **prefer this over any standalone SQL dump.**

1. `supabase/migrations/20260101000000_setup.sql`
2. `supabase/migrations/20260101000001_fix_rls.sql`
3. `supabase/migrations/20260218000000_chat_tables.sql`
4. `supabase/migrations/20260227000000_add_missing_indexes.sql`
5. `supabase/migrations/20260227010000_proper_rls_policies.sql`
6. `supabase/migrations/20260306172000_rbac_hardening_and_storage_lockdown.sql`
7. `supabase/migrations/20260306190500_rls_and_function_hardening_followup.sql`
8. `supabase/migrations/20260405000000_harden_admin_auth_user_rpcs.sql`
9. `supabase/migrations/20260408000000_drop_full_access_policies.sql`
10. `supabase/migrations/20260408010000_secure_employee_private_data_and_avatars.sql`
11. `supabase/migrations/20260409000000_fix_employee_private_details_rls.sql`
12. `supabase/migrations/20260409122931_update_handle_new_user_avatar_initials.sql`
13. `supabase/migrations/20260409123740_20260409150000_fast_admin_create_employee_rpc.sql`
14. `supabase/migrations/20260409150000_fast_admin_create_employee_rpc.sql`
15. `supabase/migrations/20260409190000_fix_admin_create_employee_trigger_conflict.sql`
16. `supabase/migrations/20260409193000_fix_admin_create_employee_jsonb_return.sql`
17. `supabase/migrations/20260417120633_optimize_rls_helpers_and_fk_index.sql`
18. `supabase/migrations/20260417210955_resolve_backend_issues.sql`
19. `supabase/migrations/20260417212511_extend_performance_schema_and_secure_analytics.sql`
20. `supabase/migrations/20260420000000_add_color_theme.sql`
21. `supabase/migrations/20260405000001_harden_admin_update_auth_email.sql`
22. `supabase/migrations/20260421000000_harden_chat_rls.sql`
</details>

<details>
<summary><b>Option B: Supabase CLI (applies all migrations automatically)</b></summary>
<br>

If you have the Supabase CLI linked to your project, simply run:

```bash
supabase db push
```

This applies every file under `supabase/migrations/` in filename order, which is equivalent to Option A.
</details>

### 4. Running the Development Server

Start the Vite development server:

```bash
bun run dev
```

The application will be available at [`http://localhost:5173`](http://localhost:5173).

#### Demo Login

If you fully initialized the DB with the seed script (`Option A`), you can log in as an Admin:
- **Email**: `admin@gmail.com`
- **Password**: `Admin@123`

---

## Docker Deployment

The repository includes a highly-optimized multi-stage `Dockerfile` and `docker-compose.yml` for serving the production build (via Nginx) on port `8080`.

1. Ensure your `.env` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Build and spin up the container:

```bash
docker compose up -d --build
```
3. Access the app at [`http://localhost:8080`](http://localhost:8080).

---

## Access & Roles Matrix

Synergy employs strict role-based routing. Data is protected both client-side and via PostgreSQL Row Level Security (RLS) on the backend.

| Area/Module | Employee | Manager | Admin |
| :--- | :---: | :---: | :---: |
| **`/dashboard`** | Yes | Yes | Yes |
| **`/analytics`** | No | Yes | Yes |
| **`/employees`** *(Directory & Profiles)* | No | Yes | Yes |
| **`/reports`** | No | Yes | Yes |
| **`/tasks`, `/leave`, `/chat`, `/support`, etc.** | Yes | Yes | Yes |

---

## Project Architecture

```text
synergy-crm/
├── src/
│   ├── components/      # Reusable UI elements, layout wrappers, common components
│   ├── contexts/        # Provider wrappers (Auth, Theme, Notifications, Toast)
│   ├── features/        # Domain modules (Employees, Tasks, Chat, Leave, Analytics...)
│   ├── pages/           # Route-level pages (Login, Profile, EmployeeDetail, Settings)
│   ├── services/        # Supabase data-access layer (one module per domain)
│   ├── lib/             # Supabase client, react-query client, helpers
│   ├── store/           # Zustand UI state (e.g. mobile menu)
│   ├── utils/           # Pure helpers (roles, dates, storage, avatars)
│   └── themes/          # Theme/accent definitions
├── supabase/migrations/ # Sequential, version-controlled schema + RLS migrations
├── public/              # Static assets, Web App Manifest, Service Worker
├── Dockerfile           # Multi-stage build definition
├── docker-compose.yml   # Local orchestration
└── nginx.conf           # Reverse proxy configuration for SPA routing & caching
```

---

## Available Bun Scripts

- `bun run dev` - Starts the Vite development server.
- `bun run build` - Compiles the React application for production into `dist/`.
- `bun run preview` - Previews the locally built production bundle.
- `bun run lint` - Runs ESLint against the codebase.

---

## Important Notes

- **Package Manager**: This repo targets `bun@1.3.9` (declared via `packageManager` in `package.json`). Use `bun` for install and scripts. (Note: there is no `preinstall`/`only-allow` guard — installs are not enforced at the CLI level, so avoid mixing package managers.)
- **Environment Variables**: If environment variables are missing, the application will fall back to placeholder Supabase values, and authentication/data calls will silently fail.
- **Microservices/Features**: The Team Chat feature requires specific migration tables (`conversations`, `messages`, `message_reactions`, `user_presence`) to function correctly.

---

## License

This project is **open-source and free to use**. Feel free to fork, modify, and distribute it for personal or commercial projects.
