<div align="center">
  <h1>Synergy EMS</h1>
  <p><strong>A Modern Employee Management System & Internal Operations Platform</strong></p>
  
  [![React](https://img.shields.io/badge/React-19-blue.svg?style=flat&logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![Bun](https://img.shields.io/badge/Bun-1.3.9-000000.svg?style=flat&logo=bun)](https://bun.sh/)
  [![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18.svg?style=flat&logo=vitest)](https://vitest.dev/)
  [![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen.svg?style=flat)]()

  <br />

  [**View Live Demo**](https://synergy-emp-crm.vercel.app/) • 
  [**Report a Bug**](https://github.com/sunil-gumatimath/synergy-crm/issues) • 
  [**Request a Feature**](https://github.com/sunil-gumatimath/synergy-crm/issues)
</div>

<hr />

## About the Project

**Synergy EMS** is a full-featured employee management platform for growing teams. Instead of relying on fragmented tools for HR, tasks, and communication, Synergy consolidates everything into a fast single-page application (SPA).

Built with **React 19** and powered by **Supabase** (PostgreSQL + Realtime + Auth + Storage), it delivers a role-based dashboard experience for employees, managers, and administrators. Routes are lazy-loaded, data is cached with TanStack Query, and access is enforced both in the UI and through PostgreSQL Row Level Security (RLS).

### Key Features

- **HR & Employee Directory**: Profiles, onboarding documents, admin notes, bank/education details, bulk actions, filtering, and virtualized card/list views.
- **Role-Based Access Control (RBAC)**: Distinct navigation and permissions for `Admin`, `Manager`, and `Employee` roles.
- **Time & Attendance**: Leave requests and approvals, daily time tracking, work schedules, overtime, and an organizational calendar.
- **Productivity**: Kanban-style task boards with drag-and-drop (`@hello-pangea/dnd`), help-desk ticketing, and structured performance reviews.
- **Real-Time Collaboration**: Team chat with presence indicators powered by Supabase Realtime.
- **Analytics & Reporting**: Manager/admin dashboards with interactive charts (`Recharts`) and exportable reports.
- **Settings & Theming**: Light/dark/system modes, multiple color themes, accent colors, compact layout, and per-user preferences stored in Supabase.
- **Production-Ready**: Code-split Vite builds, Tailwind CSS 4, Docker + Nginx deployment, and PWA support (manifest + service worker).

---

## Tech Stack

| Category | Technology |
| --- | --- |
| **Frontend** | React 19, React Router DOM 7 |
| **Styling & UI** | Tailwind CSS 4, React Icons, Radix UI (Dialog, Dropdown Menu) |
| **State & Data** | TanStack React Query, Zustand, React Context |
| **Forms & Validation** | React Hook Form, Zod, `@hookform/resolvers` |
| **Build & Runtime** | Vite 8, Bun 1.3.9 |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| **Charts & UX** | Recharts, TanStack Virtual, date-fns, DOMPurify |
| **Testing** | Vitest, Testing Library, jsdom |
| **Deployment** | Docker (multi-stage Bun build), Nginx, Vercel (live demo) |

---

## Application Modules

| Route | Module | Employee | Manager | Admin |
| :--- | :--- | :---: | :---: | :---: |
| `/dashboard` | Personal dashboard & stats | Yes | Yes | Yes |
| `/analytics` | Org-wide analytics (default landing for managers/admins) | No | Yes | Yes |
| `/employees` | Employee directory | No | Yes | Yes |
| `/employees/:id` | Employee detail profile | No | Yes | Yes |
| `/tasks` | Kanban task board | Yes | Yes | Yes |
| `/timetracking` | Time entries & timesheets | Yes | Yes | Yes |
| `/leave` | Leave management | Yes | Yes | Yes |
| `/chat` | Team chat | Yes | Yes | Yes |
| `/support` | Help desk / support tickets | Yes | Yes | Yes |
| `/calendar` | Shared calendar & events | Yes | Yes | Yes |
| `/performance` | Performance reviews | Yes | Yes | Yes |
| `/reports` | Reports & exports | No | Yes | Yes |
| `/settings` | Account, appearance, security | Yes | Yes | Yes |
| `/profile` | User profile | Yes | Yes | Yes |
| `/login`, `/reset-password` | Public auth routes | — | — | — |

---

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- **[Bun](https://bun.sh/)** — package manager and runtime (`bun@1.3.9` in `package.json`)
- **[Supabase](https://supabase.com/)** — project for database, auth, realtime, and storage
- **[Docker](https://www.docker.com/)** *(optional)* — for the containerized production build
- **[Supabase CLI](https://supabase.com/docs/guides/cli)** *(recommended)* — for applying migrations

### 1. Installation

```bash
git clone https://github.com/sunil-gumatimath/synergy-crm.git
cd synergy-crm
bun install
```

### 2. Environment Configuration

Copy the example environment file and add your Supabase credentials:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# Linux/macOS
cp .env.example .env.local
```

Update `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional — used for password-reset redirects in production
VITE_APP_URL=http://localhost:5173
```

Get credentials from [Supabase Project Settings → API](https://app.supabase.com/project/_/settings/api).

> If env vars are missing, the app falls back to placeholder Supabase values and auth/data calls will fail silently.

### 3. Database Initialization

Apply migrations in filename order. **Prefer the Supabase CLI** — it applies every file under `supabase/migrations/` automatically:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

<details>
<summary><b>Manual migration order (SQL Editor or <code>supabase migration up</code>)</b></summary>
<br>

1. `supabase/migrations/20260101000000_setup.sql`
2. `supabase/migrations/20260101000001_fix_rls.sql`
3. `supabase/migrations/20260218000000_chat_tables.sql`
4. `supabase/migrations/20260227000000_add_missing_indexes.sql`
5. `supabase/migrations/20260227010000_proper_rls_policies.sql`
6. `supabase/migrations/20260306172000_rbac_hardening_and_storage_lockdown.sql`
7. `supabase/migrations/20260306190500_rls_and_function_hardening_followup.sql`
8. `supabase/migrations/20260405000000_harden_admin_auth_user_rpcs.sql`
9. `supabase/migrations/20260405000001_harden_admin_update_auth_email.sql`
10. `supabase/migrations/20260408000000_drop_full_access_policies.sql`
11. `supabase/migrations/20260408010000_secure_employee_private_data_and_avatars.sql`
12. `supabase/migrations/20260409000000_fix_employee_private_details_rls.sql`
13. `supabase/migrations/20260409122931_update_handle_new_user_avatar_initials.sql`
14. `supabase/migrations/20260409123740_20260409150000_fast_admin_create_employee_rpc.sql`
15. `supabase/migrations/20260409150000_fast_admin_create_employee_rpc.sql`
16. `supabase/migrations/20260409190000_fix_admin_create_employee_trigger_conflict.sql`
17. `supabase/migrations/20260409193000_fix_admin_create_employee_jsonb_return.sql`
18. `supabase/migrations/20260417120633_optimize_rls_helpers_and_fk_index.sql`
19. `supabase/migrations/20260417210955_resolve_backend_issues.sql`
20. `supabase/migrations/20260417212511_extend_performance_schema_and_secure_analytics.sql`
21. `supabase/migrations/20260419211009_add_color_theme.sql`
22. `supabase/migrations/20260421000000_harden_chat_rls.sql`

See `supabase/migrations/README.md` for notes on duplicate migration versions that must not be renamed.

</details>

The initial setup migration (`20260101000000_setup.sql`) creates **26 tables**, enables RLS, and seeds demo data (employees, tasks, leave, time entries, reviews, and more).

#### Local Admin Login

After migrations, create a matching Supabase Auth user so you can sign in:

1. In the Supabase dashboard, go to **Authentication → Users → Add user**.
2. Create a user with:
   - **Email**: `admin@gmail.com`
   - **Password**: `Admin@123`
   - **User metadata** (optional but recommended): `{ "role": "Admin", "full_name": "Sunil Gumatimath" }`
3. The app links auth users to seeded `employees` rows by `user_id` or email.

Managers and admins are redirected to `/analytics` on login; employees land on `/dashboard`.

### 4. Running the Development Server

```bash
bun run dev
```

Open [`http://localhost:5173`](http://localhost:5173).

### 5. Running Tests

```bash
bun run test        # watch mode
bun run test:run    # single run (CI)
bun run test:coverage
```

Tests live alongside source under `src/**/*.{test,spec}.{js,jsx}` (services, utils, auth).

---

## Docker Deployment

The repo includes a multi-stage `Dockerfile` (Bun build → Nginx serve) and `docker-compose.yml` on port **8080**.

1. Create a `.env` file (or rename `.env.local`) with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Build and start:

```bash
docker compose up -d --build
```

3. Open [`http://localhost:8080`](http://localhost:8080).

The production image runs Nginx as a non-root user with a built-in health check.

---

## Static / Vercel Deployment

For platforms like Vercel, Netlify, or any static host:

1. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_URL` in the deployment environment.
2. Build: `bun run build`
3. Serve the `dist/` folder with SPA fallback (all routes → `index.html`).

Live demo: [synergy-emp-crm.vercel.app](https://synergy-emp-crm.vercel.app/)

---

## Project Architecture

```text
synergy-crm/
├── src/
│   ├── components/       # Shared UI (layout, modals, filters, skeletons, ui primitives)
│   ├── contexts/       # Auth, Theme, Toast, Notifications
│   ├── features/       # Domain modules (analytics, chat, employees, leave, tasks…)
│   ├── pages/          # Route pages (Login, Profile, EmployeeDetail, ResetPassword)
│   ├── services/       # Supabase data-access layer (one module per domain)
│   ├── lib/            # Supabase client, React Query client, icon exports
│   ├── store/          # Zustand UI state (mobile menu, etc.)
│   ├── utils/          # Roles, dates, avatars, storage helpers
│   ├── themes/         # Color theme registry (light/dark surface tokens)
│   └── test/           # Vitest setup
├── supabase/
│   ├── migrations/     # Version-controlled schema + RLS (22 files)
│   └── rollbacks/      # Selected rollback scripts
├── public/             # Static assets, PWA manifest, service worker
├── Dockerfile          # Multi-stage Bun → Nginx production build
├── docker-compose.yml
├── nginx.conf          # SPA routing, caching, port 8080
└── vitest.config.js
```

### Data Layer

Each feature maps to a service module in `src/services/`:

`authService`, `avatarService`, `calendarService`, `chatService`, `documentService`, `employeeService`, `leaveService`, `noteService`, `notificationService`, `performanceService`, `reportsService`, `supportService`, `taskService`, `timeTrackingService`

### Security Model

- **Client**: `ProtectedRoute` guards routes by role; sensitive fields (salary, bank details) live in `employee_private_details` and are fetched on demand.
- **Server**: PostgreSQL RLS policies scope reads/writes per role; admin RPCs handle auth user provisioning; storage buckets are locked down in later migrations.
- **Chat**: Requires `conversations`, `messages`, `message_reactions`, and `user_presence` tables from the chat migration.

---

## Available Bun Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Start Vite dev server on port 5173 |
| `bun run build` | Production build to `dist/` |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint |
| `bun run test` | Run Vitest in watch mode |
| `bun run test:run` | Run Vitest once |
| `bun run test:coverage` | Run tests with coverage report |

---

## Important Notes

- **Package manager**: Use `bun` for installs and scripts. There is no `preinstall` guard — avoid mixing npm/yarn/pnpm lockfiles.
- **Icons**: UI icons come from `react-icons` via `src/lib/icons.js` (no `lucide-react` dependency).
- **PWA**: Service worker registers in production only; dev mode unregisters stale workers automatically.
- **Performance**: Heavy routes (analytics, employees, tasks) use `React.lazy` + route-level skeletons; Recharts is excluded from the main vendor chunk.
- **Migrations**: Do not delete or rename applied migration versions without repairing remote migration history first (see `supabase/migrations/README.md`).

---

## License

This project is **open-source and free to use**. Fork, modify, and distribute it for personal or commercial projects.