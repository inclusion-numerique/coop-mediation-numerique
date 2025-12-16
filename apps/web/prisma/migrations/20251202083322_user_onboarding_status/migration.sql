-- CreateEnum
CREATE TYPE "public"."OnboardingStatus" AS ENUM ('reminder_j7_sent', 'reminder_j30_sent', 'reminder_j60_sent', 'warning_j90_sent');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "onboarding_status" "public"."OnboardingStatus";
