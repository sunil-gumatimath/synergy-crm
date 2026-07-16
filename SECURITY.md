# Security Policy

## Reporting a Vulnerability

We take the security of Synergy EMS seriously. If you discover a security
vulnerability, please **do not open a public GitHub issue**.

Instead, report it privately via GitHub's
[security advisories](https://github.com/sunil-gumatimath/synergy-crm/security/advisories/new)
or email the maintainer directly.

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce
- Affected version(s)
- Any suggested mitigation, if known

We aim to acknowledge reports within **72 hours** and provide a remediation
timeline within **7 days**.

## Supported Versions

Only the latest released version on the `main` branch receives security
updates. Older versions are not patched.

## Credential & Secret Handling

Synergy EMS is a frontend SPA backed by Supabase. Understanding the trust
boundary is critical:

### Client-side (public) keys — safe to expose in the frontend

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These are embedded in the built bundle by design. They are **not** secrets.
Access is enforced entirely by **PostgreSQL Row Level Security (RLS)** and
database roles, not by hiding the anon key. Never rely on obscuring the anon
key for security.

### Secrets that must NEVER be committed

- Supabase **service role** key (server-side only)
- Database passwords
- Any `.env`, `.env.local`, or `.env.*.local` file

These are git-ignored (see `.gitignore`). If one is ever committed:

1. **Revoke / rotate it immediately** in the Supabase dashboard
   (Project Settings → API → regenerate keys).
2. Purge it from git history (`git filter-repo` or BFG Repo-Cleaner).
3. Force-push the cleaned history and notify collaborators to re-clone.

### Local development

1. Copy `.env.example` to `.env.local`.
2. Fill in your Supabase project URL and anon key.
3. `.env.local` is excluded from version control — never rename it to `.env`
   and commit it.

## Database Security Posture

This project enforces authorization at the database layer:

- **RLS is enabled** on all tables holding employee data.
- **RBAC** via a `role` column (`Employee`, `Manager`, `Admin`) with
  server-side policy checks.
- **Storage lockdown**: avatar/private buckets are access-restricted.
- **Admin RPCs** (e.g. employee creation, email updates) are hardened with
  definer-security and ownership checks.

Frontend route guards (`ProtectedRoute`) are a UX convenience only and are
**not** a security boundary — the database is the source of truth.

## Dependency Management

Dependencies are pinned via `bun.lock` and installed with `--frozen-lockfile`
in CI and Docker builds. Audit periodically with `bun audit`.
