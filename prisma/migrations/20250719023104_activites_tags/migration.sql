-- CreateTable
CREATE TABLE "activite_tags" (
    "activite_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "activite_tags_pkey" PRIMARY KEY ("activite_id","tag_id")
);

-- AddForeignKey
ALTER TABLE "activite_tags" ADD CONSTRAINT "activite_tags_activite_id_fkey" FOREIGN KEY ("activite_id") REFERENCES "activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activite_tags" ADD CONSTRAINT "activite_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
