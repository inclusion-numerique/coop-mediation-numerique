-- Remove 'rdv-service-public' from all users' feature_flags arrays
UPDATE "users" 
SET "feature_flags" = array_remove("feature_flags", 'rdv-service-public'::"user_feature_flag")
WHERE 'rdv-service-public'::"user_feature_flag" = ANY("feature_flags");

-- Create new enum without 'rdv-service-public'
CREATE TYPE "user_feature_flag_new" AS ENUM ('assistant');

-- Add temporary column with new enum type
ALTER TABLE "users" 
  ADD COLUMN "feature_flags_new" "user_feature_flag_new"[] DEFAULT '{}';

-- Copy data: if 'assistant' exists in old array, set it in new column
UPDATE "users"
SET "feature_flags_new" = CASE 
  WHEN 'assistant'::"user_feature_flag" = ANY("feature_flags") THEN ARRAY['assistant'::"user_feature_flag_new"]
  ELSE '{}'::"user_feature_flag_new"[]
END;

-- Drop old column
ALTER TABLE "users" DROP COLUMN "feature_flags";

-- Rename new column to original name
ALTER TABLE "users" RENAME COLUMN "feature_flags_new" TO "feature_flags";

-- Drop the old enum
DROP TYPE "user_feature_flag";

-- Rename the new enum to the original name
ALTER TYPE "user_feature_flag_new" RENAME TO "user_feature_flag";

