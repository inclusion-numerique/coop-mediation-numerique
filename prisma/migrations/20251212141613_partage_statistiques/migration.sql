-- CreateTable
CREATE TABLE "public"."partage_statistiques" (
    "id" UUID NOT NULL,
    "mediateur_id" UUID NOT NULL,

    CONSTRAINT "partage_statistiques_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partage_statistiques_mediateur_id_key" ON "public"."partage_statistiques"("mediateur_id");

-- AddForeignKey
ALTER TABLE "public"."partage_statistiques" ADD CONSTRAINT "partage_statistiques_mediateur_id_fkey" FOREIGN KEY ("mediateur_id") REFERENCES "public"."mediateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
