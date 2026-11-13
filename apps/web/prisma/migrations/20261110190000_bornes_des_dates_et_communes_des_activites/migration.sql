ALTER TABLE "coop"."activites"
  ADD CONSTRAINT "activites_lieu_code_insee_forme_check"
  CHECK ("lieu_code_insee" IS NULL OR "lieu_code_insee" ~ '^([0-9]{5}|2[AB][0-9]{3})$');

ALTER TABLE "coop"."activites"
  ADD CONSTRAINT "activites_date_plancher_check"
  CHECK ("date" >= DATE '2020-11-17');

ALTER TABLE "coop"."activite_coordination"
  ADD CONSTRAINT "activite_coordination_date_plancher_check"
  CHECK ("date" >= DATE '2020-11-17');

CREATE FUNCTION "coop"."refuser_une_date_d_activite_trop_lointaine"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."date" > (now() AT TIME ZONE 'UTC')::date + INTERVAL '2 years' THEN
    RAISE EXCEPTION 'Date d''activité % au-delà de deux ans', NEW."date"
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "activites_date_plafond"
  BEFORE INSERT OR UPDATE OF "date" ON "coop"."activites"
  FOR EACH ROW EXECUTE FUNCTION "coop"."refuser_une_date_d_activite_trop_lointaine"();

CREATE TRIGGER "activite_coordination_date_plafond"
  BEFORE INSERT OR UPDATE OF "date" ON "coop"."activite_coordination"
  FOR EACH ROW EXECUTE FUNCTION "coop"."refuser_une_date_d_activite_trop_lointaine"();
