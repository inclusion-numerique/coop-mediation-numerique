ALTER TABLE "coop"."lieu_inclusion"
  ADD CONSTRAINT "lieu_inclusion_code_insee_forme_check"
  CHECK (
    "code_insee" IS NULL
    OR "code_insee" ~ '^((0[1-9]|1[0-9]|2[AB]|2[1-9]|[3-8][0-9]|9[0-5])[0-9]{3}|(97[1-8]|98[1-9])[0-9]{2})$'
  );
