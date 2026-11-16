SET lock_timeout = '10s';

ALTER TABLE "coop"."users" DROP COLUMN "title",
DROP COLUMN "location",
DROP COLUMN "description";
