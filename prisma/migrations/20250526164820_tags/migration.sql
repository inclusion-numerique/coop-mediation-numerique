-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "departement" TEXT,
    "mediateur_id" UUID,
    "creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suppression" TIMESTAMP(3),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_mediateur_id_fkey" FOREIGN KEY ("mediateur_id") REFERENCES "mediateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
