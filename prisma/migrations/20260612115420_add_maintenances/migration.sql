-- CreateTable
CREATE TABLE "coop"."maintenances" (
    "id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "message" TEXT,
    "created_by" UUID,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenances_ended_at_idx" ON "coop"."maintenances"("ended_at");
