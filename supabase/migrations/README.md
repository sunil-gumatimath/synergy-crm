# Migration Notes

The remote Supabase project has both `20260409123740` and `20260409150000`
recorded for the employee-create RPC lineage.

Why both exist:

- `20260409123740_20260409150000_fast_admin_create_employee_rpc.sql`
  was added locally to match a migration version that already existed on the
  remote project but was missing from this repo.
- `20260409150000_fast_admin_create_employee_rpc.sql` is the original
  repo-side migration for the same RPC family and is also present in the
  remote migration table.
- `20260409190000_fix_admin_create_employee_trigger_conflict.sql` fixes the
  duplicate employee insert caused by `handle_new_user()`.
- `20260409193000_fix_admin_create_employee_jsonb_return.sql` fixes the RPC
  return expression (`json` vs `jsonb`).

Do not delete or rename the applied versions above unless you also repair the
remote migration history first.

Current live RPC source of truth:

- `20260409193000_fix_admin_create_employee_jsonb_return.sql`

## Employee Private Details (B7 Fix Changelog)

Note for future contributors: The `performance_score` column was dropped from `public.employees` and moved exclusively to `public.employee_private_details` in migration `20260408010000_secure_employee_private_data_and_avatars.sql`. The frontend queries use flattened joins to access this score. Do not reintroduce this column on `public.employees` or assume it exists there.
