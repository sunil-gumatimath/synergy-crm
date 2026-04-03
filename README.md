<div align="center">
  <h1>Synergy EMS</h1>
  <p><strong>A Modern Employee Management System & Internal Operations Platform</strong></p>
  
  [![React](https://img.shields.io/badge/React-19-blue.svg?style=flat&logo=react)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
  [![Bun](https://img.shields.io/badge/Bun-Runtime-000000.svg?style=flat&logo=bun)](https://bun.sh/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
<summary><b>Option A: Quick Setup (Recommended for Local Dev/Demo)</b></summary>
<br>

1. Navigate to the SQL Editor in your Supabase Dashboard.
2. Run the full setup script: `database/synergy_ems_complete.sql`.
   *(Warning: This is destructive and will drop/recreate core tables while inserting seed data.)*
3. Run `supabase/migrations/20260218000000_chat_tables.sql` for chat tables.
4. *(Optional)* Run `database/update_user_roles.sql` if you need to adjust specific test users.
</details>

<details>
<summary><b>Option B: Migration-Driven Setup</b></summary>
<br>

Run the following migrations in order via the Supabase CLI or SQL Editor:
1. `supabase/migrations/20260101000000_setup.sql`
2. `supabase/migrations/20260101000001_fix_rls.sql`
3. `supabase/migrations/20260218000000_chat_tables.sql`
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
│   ├── components/      # Reusable UI elements, layout wrappers, and global components
│   ├── contexts/        # Provider wrappers (Auth, Theme, Notifications)
│   ├── features/        # Domain-driven architecture (Employees, Tasks, Chat, Leave)
│   ├── pages/           # Route-level components (Login, Profile, Settings)
│   ├── services/        # Abstraction layer for Supabase data operations
│   └── lib/             # Core utilities, Supabase client initialization
├── database/            # Complete SQL bootstrap and utility scripts
├── supabase/migrations/ # Sequential Supabase migration scripts
├── public/              # Static assets, Web App Manifest, Service Workers
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

- **Package Manager Restrictions**: Non-Bun installs are blocked by a `preinstall` script (`bunx only-allow bun`). Always use `bun`.
- **Environment Variables**: If environment variables are missing, the application will fall back to placeholder Supabase values, and authentication/data calls will silently fail.
- **Microservices/Features**: The Team Chat feature requires specific migration tables (`conversations`, `messages`, `message_reactions`, `user_presence`) to function correctly.

---

## License

This project is open-source and free to use under the **[MIT License](LICENSE)**.
