-- Move Prisma's migration-tracking table into the `coop` schema.
--
-- Coop and the MIN/Dataspace entrepôt both run Prisma, so both own a
-- `public._prisma_migrations` table. Prisma hardcodes that name and forbids
-- renaming it (prisma/prisma#18625, #14806), so once the two databases are
-- merged the tables would collide. Isolating Coop's history in `coop`
-- (`coop._prisma_migrations`) lets MIN keep `public._prisma_migrations`.
--
-- This runs out-of-band, AFTER `prisma migrate deploy` (never inside a
-- migration), so the migration engine never holds a cached `public` reference
-- while the table moves. Prisma resolves the relocated table through the
-- connection search_path (`coop,public`) — validated with `migrate status`.
--
-- Idempotent: only acts while the table is still in `public` and `coop`
-- exists, so it is a no-op on every run after the one-time move.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations')
     AND EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'coop') THEN
    ALTER TABLE public._prisma_migrations SET SCHEMA coop;
  END IF;
END $$;
