SET lock_timeout = '10s';

ALTER TABLE "coop"."activites" ALTER COLUMN "accompagnements_count" SET DEFAULT 0;

ALTER TABLE "coop"."tags" ADD COLUMN "accompagnements_count" INTEGER NOT NULL DEFAULT 0;

CREATE FUNCTION "coop"."compteurs_lignes"(operation text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE operation
    WHEN 'INSERT' THEN 'SELECT n.*, 1 AS signe FROM nouvelles n'
    WHEN 'DELETE' THEN 'SELECT o.*, -1 AS signe FROM anciennes o'
    ELSE 'SELECT n.*, 1 AS signe FROM nouvelles n UNION ALL SELECT o.*, -1 AS signe FROM anciennes o'
  END
$$;

CREATE FUNCTION "coop"."compteurs_apres_accompagnements"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  precedent text := coalesce(current_setting('coop.compteurs', true), '');
BEGIN
  PERFORM set_config('coop.compteurs', 'on', true);

  EXECUTE format($q$
    WITH lignes AS (%s)
    UPDATE coop.beneficiaires b SET accompagnements_count = b.accompagnements_count + d.delta
    FROM (
      SELECT l.beneficiaire_id, sum(l.signe)::int AS delta
      FROM lignes l JOIN coop.activites a ON a.id = l.activite_id AND a.suppression IS NULL
      GROUP BY 1 HAVING sum(l.signe) <> 0
    ) d
    WHERE b.id = d.beneficiaire_id
  $q$, coop.compteurs_lignes(TG_OP));

  EXECUTE format($q$
    WITH lignes AS (%s)
    UPDATE coop.activites a SET accompagnements_count = a.accompagnements_count + d.delta
    FROM (SELECT activite_id, sum(signe)::int AS delta FROM lignes GROUP BY 1 HAVING sum(signe) <> 0) d
    WHERE a.id = d.activite_id
  $q$, coop.compteurs_lignes(TG_OP));

  PERFORM set_config('coop.compteurs', precedent, true);
  RETURN NULL;
END $$;

CREATE FUNCTION "coop"."compteurs_apres_activites"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  precedent text := coalesce(current_setting('coop.compteurs', true), '');
BEGIN
  PERFORM set_config('coop.compteurs', 'on', true);

  EXECUTE format($q$
    WITH lignes AS (%s)
    UPDATE coop.mediateurs m
    SET activites_count = m.activites_count + d.activites,
        accompagnements_count = m.accompagnements_count + d.accompagnements
    FROM (
      SELECT mediateur_id,
        coalesce(sum(signe) FILTER (WHERE suppression IS NULL), 0)::int AS activites,
        coalesce(sum(signe * accompagnements_count) FILTER (WHERE suppression IS NULL), 0)::int AS accompagnements
      FROM lignes GROUP BY 1
    ) d
    WHERE m.id = d.mediateur_id AND (d.activites <> 0 OR d.accompagnements <> 0)
  $q$, coop.compteurs_lignes(TG_OP));

  EXECUTE format($q$
    WITH lignes AS (%s)
    UPDATE coop.lieu_inclusion l SET activites_count = l.activites_count + d.delta
    FROM (
      SELECT structure_id, sum(signe)::int AS delta FROM lignes
      WHERE suppression IS NULL AND structure_id IS NOT NULL
      GROUP BY 1 HAVING sum(signe) <> 0
    ) d
    WHERE l.id = d.structure_id
  $q$, coop.compteurs_lignes(TG_OP));

  IF TG_OP = 'UPDATE' THEN
    UPDATE coop.tags t SET accompagnements_count = t.accompagnements_count + d.delta
    FROM (
      SELECT at.tag_id, sum(
        CASE WHEN n.suppression IS NULL THEN n.accompagnements_count ELSE 0 END
        - CASE WHEN o.suppression IS NULL THEN o.accompagnements_count ELSE 0 END
      )::int AS delta
      FROM anciennes o JOIN nouvelles n USING (id) JOIN coop.activite_tags at ON at.activite_id = n.id
      GROUP BY 1
    ) d
    WHERE t.id = d.tag_id AND d.delta <> 0;

    UPDATE coop.beneficiaires b SET accompagnements_count = b.accompagnements_count + d.delta
    FROM (
      SELECT acc.beneficiaire_id, sum(CASE WHEN n.suppression IS NULL THEN 1 ELSE -1 END)::int AS delta
      FROM anciennes o JOIN nouvelles n USING (id) JOIN coop.accompagnements acc ON acc.activite_id = n.id
      WHERE (o.suppression IS NULL) <> (n.suppression IS NULL)
      GROUP BY 1
    ) d
    WHERE b.id = d.beneficiaire_id AND d.delta <> 0;
  END IF;

  PERFORM set_config('coop.compteurs', precedent, true);
  RETURN NULL;
END $$;

CREATE FUNCTION "coop"."compteurs_apres_beneficiaires"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  precedent text := coalesce(current_setting('coop.compteurs', true), '');
BEGIN
  PERFORM set_config('coop.compteurs', 'on', true);

  EXECUTE format($q$
    WITH lignes AS (%s)
    UPDATE coop.mediateurs m SET beneficiaires_count = m.beneficiaires_count + d.delta
    FROM (
      SELECT mediateur_id, sum(signe)::int AS delta FROM lignes
      WHERE suppression IS NULL GROUP BY 1 HAVING sum(signe) <> 0
    ) d
    WHERE m.id = d.mediateur_id
  $q$, coop.compteurs_lignes(TG_OP));

  PERFORM set_config('coop.compteurs', precedent, true);
  RETURN NULL;
END $$;

CREATE FUNCTION "coop"."compteurs_apres_activite_tags"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  precedent text := coalesce(current_setting('coop.compteurs', true), '');
BEGIN
  PERFORM set_config('coop.compteurs', 'on', true);

  EXECUTE format($q$
    WITH lignes AS (%s)
    UPDATE coop.tags t SET accompagnements_count = t.accompagnements_count + d.delta
    FROM (
      SELECT l.tag_id, sum(l.signe * a.accompagnements_count)::int AS delta
      FROM lignes l JOIN coop.activites a ON a.id = l.activite_id AND a.suppression IS NULL
      GROUP BY 1
    ) d
    WHERE t.id = d.tag_id AND d.delta <> 0
  $q$, coop.compteurs_lignes(TG_OP));

  PERFORM set_config('coop.compteurs', precedent, true);
  RETURN NULL;
END $$;

CREATE FUNCTION "coop"."compteurs_apres_activite_coordination_tags"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  precedent text := coalesce(current_setting('coop.compteurs', true), '');
BEGIN
  PERFORM set_config('coop.compteurs', 'on', true);

  EXECUTE format($q$
    WITH lignes AS (%s)
    UPDATE coop.tags t SET accompagnements_count = t.accompagnements_count + d.delta
    FROM (
      SELECT l.tag_id, sum(l.signe)::int AS delta
      FROM lignes l JOIN coop.activite_coordination a ON a.id = l.activite_coordination_id AND a.suppression IS NULL
      GROUP BY 1 HAVING sum(l.signe) <> 0
    ) d
    WHERE t.id = d.tag_id
  $q$, coop.compteurs_lignes(TG_OP));

  PERFORM set_config('coop.compteurs', precedent, true);
  RETURN NULL;
END $$;

CREATE FUNCTION "coop"."compteurs_apres_activite_coordination"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  precedent text := coalesce(current_setting('coop.compteurs', true), '');
BEGIN
  PERFORM set_config('coop.compteurs', 'on', true);

  UPDATE coop.tags t SET accompagnements_count = t.accompagnements_count + d.delta
  FROM (
    SELECT act.tag_id, sum(CASE WHEN n.suppression IS NULL THEN 1 ELSE -1 END)::int AS delta
    FROM anciennes o JOIN nouvelles n USING (id) JOIN coop.activite_coordination_tags act ON act.activite_coordination_id = n.id
    WHERE (o.suppression IS NULL) <> (n.suppression IS NULL)
    GROUP BY 1
  ) d
  WHERE t.id = d.tag_id AND d.delta <> 0;

  PERFORM set_config('coop.compteurs', precedent, true);
  RETURN NULL;
END $$;

CREATE FUNCTION "coop"."compteurs_garder_activite"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('coop.compteurs', true) IS DISTINCT FROM 'on' THEN
    NEW.accompagnements_count := CASE WHEN TG_OP = 'INSERT' THEN 0 ELSE OLD.accompagnements_count END;
  END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION "coop"."compteurs_garder_beneficiaire"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('coop.compteurs', true) IS DISTINCT FROM 'on' THEN
    NEW.accompagnements_count := CASE WHEN TG_OP = 'INSERT' THEN 0 ELSE OLD.accompagnements_count END;
  END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION "coop"."compteurs_garder_tag"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('coop.compteurs', true) IS DISTINCT FROM 'on' THEN
    NEW.accompagnements_count := CASE WHEN TG_OP = 'INSERT' THEN 0 ELSE OLD.accompagnements_count END;
  END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION "coop"."compteurs_garder_mediateur"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('coop.compteurs', true) IS DISTINCT FROM 'on' THEN
    NEW.activites_count := CASE WHEN TG_OP = 'INSERT' THEN 0 ELSE OLD.activites_count END;
    NEW.accompagnements_count := CASE WHEN TG_OP = 'INSERT' THEN 0 ELSE OLD.accompagnements_count END;
    NEW.beneficiaires_count := CASE WHEN TG_OP = 'INSERT' THEN 0 ELSE OLD.beneficiaires_count END;
  END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION "coop"."compteurs_garder_lieu"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('coop.compteurs', true) IS DISTINCT FROM 'on' THEN
    NEW.activites_count := CASE WHEN TG_OP = 'INSERT' THEN 0 ELSE OLD.activites_count END;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER "compteurs_garder" BEFORE INSERT OR UPDATE OF "accompagnements_count" ON "coop"."activites"
  FOR EACH ROW EXECUTE FUNCTION "coop"."compteurs_garder_activite"();
CREATE TRIGGER "compteurs_garder" BEFORE INSERT OR UPDATE OF "accompagnements_count" ON "coop"."beneficiaires"
  FOR EACH ROW EXECUTE FUNCTION "coop"."compteurs_garder_beneficiaire"();
CREATE TRIGGER "compteurs_garder" BEFORE INSERT OR UPDATE OF "accompagnements_count" ON "coop"."tags"
  FOR EACH ROW EXECUTE FUNCTION "coop"."compteurs_garder_tag"();
CREATE TRIGGER "compteurs_garder" BEFORE INSERT OR UPDATE OF "activites_count", "accompagnements_count", "beneficiaires_count" ON "coop"."mediateurs"
  FOR EACH ROW EXECUTE FUNCTION "coop"."compteurs_garder_mediateur"();
CREATE TRIGGER "compteurs_garder" BEFORE INSERT OR UPDATE OF "activites_count" ON "coop"."lieu_inclusion"
  FOR EACH ROW EXECUTE FUNCTION "coop"."compteurs_garder_lieu"();

CREATE TRIGGER "compteurs_apres_insertion" AFTER INSERT ON "coop"."accompagnements"
  REFERENCING NEW TABLE AS nouvelles FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_accompagnements"();
CREATE TRIGGER "compteurs_apres_modification" AFTER UPDATE ON "coop"."accompagnements"
  REFERENCING OLD TABLE AS anciennes NEW TABLE AS nouvelles FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_accompagnements"();
CREATE TRIGGER "compteurs_apres_suppression" AFTER DELETE ON "coop"."accompagnements"
  REFERENCING OLD TABLE AS anciennes FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_accompagnements"();

CREATE TRIGGER "compteurs_apres_insertion" AFTER INSERT ON "coop"."activites"
  REFERENCING NEW TABLE AS nouvelles FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_activites"();
CREATE TRIGGER "compteurs_apres_modification" AFTER UPDATE ON "coop"."activites"
  REFERENCING OLD TABLE AS anciennes NEW TABLE AS nouvelles FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_activites"();
CREATE TRIGGER "compteurs_apres_suppression" AFTER DELETE ON "coop"."activites"
  REFERENCING OLD TABLE AS anciennes FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_activites"();

CREATE TRIGGER "compteurs_apres_insertion" AFTER INSERT ON "coop"."beneficiaires"
  REFERENCING NEW TABLE AS nouvelles FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_beneficiaires"();
CREATE TRIGGER "compteurs_apres_modification" AFTER UPDATE ON "coop"."beneficiaires"
  REFERENCING OLD TABLE AS anciennes NEW TABLE AS nouvelles FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_beneficiaires"();
CREATE TRIGGER "compteurs_apres_suppression" AFTER DELETE ON "coop"."beneficiaires"
  REFERENCING OLD TABLE AS anciennes FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_beneficiaires"();

CREATE TRIGGER "compteurs_apres_insertion" AFTER INSERT ON "coop"."activite_tags"
  REFERENCING NEW TABLE AS nouvelles FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_activite_tags"();
CREATE TRIGGER "compteurs_apres_modification" AFTER UPDATE ON "coop"."activite_tags"
  REFERENCING OLD TABLE AS anciennes NEW TABLE AS nouvelles FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_activite_tags"();
CREATE TRIGGER "compteurs_apres_suppression" AFTER DELETE ON "coop"."activite_tags"
  REFERENCING OLD TABLE AS anciennes FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_activite_tags"();

CREATE TRIGGER "compteurs_apres_insertion" AFTER INSERT ON "coop"."activite_coordination_tags"
  REFERENCING NEW TABLE AS nouvelles FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_activite_coordination_tags"();
CREATE TRIGGER "compteurs_apres_modification" AFTER UPDATE ON "coop"."activite_coordination_tags"
  REFERENCING OLD TABLE AS anciennes NEW TABLE AS nouvelles FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_activite_coordination_tags"();
CREATE TRIGGER "compteurs_apres_suppression" AFTER DELETE ON "coop"."activite_coordination_tags"
  REFERENCING OLD TABLE AS anciennes FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_activite_coordination_tags"();

CREATE TRIGGER "compteurs_apres_modification" AFTER UPDATE ON "coop"."activite_coordination"
  REFERENCING OLD TABLE AS anciennes NEW TABLE AS nouvelles FOR EACH STATEMENT EXECUTE FUNCTION "coop"."compteurs_apres_activite_coordination"();

SELECT set_config('coop.compteurs', 'on', false);

UPDATE "coop"."activites" a
SET accompagnements_count = coalesce(r.n, 0)
FROM "coop"."activites" a2
LEFT JOIN (SELECT activite_id, count(*)::int AS n FROM "coop"."accompagnements" GROUP BY 1) r ON r.activite_id = a2.id
WHERE a.id = a2.id AND a.accompagnements_count IS DISTINCT FROM coalesce(r.n, 0);

UPDATE "coop"."beneficiaires" b
SET accompagnements_count = coalesce(r.n, 0)
FROM "coop"."beneficiaires" b2
LEFT JOIN (
  SELECT acc.beneficiaire_id, count(*)::int AS n
  FROM "coop"."accompagnements" acc
  JOIN "coop"."activites" act ON act.id = acc.activite_id AND act.suppression IS NULL
  GROUP BY 1
) r ON r.beneficiaire_id = b2.id
WHERE b.id = b2.id AND b.accompagnements_count IS DISTINCT FROM coalesce(r.n, 0);

UPDATE "coop"."mediateurs" m
SET activites_count = coalesce(a.activites, 0),
    accompagnements_count = coalesce(a.accompagnements, 0),
    beneficiaires_count = coalesce(b.beneficiaires, 0)
FROM "coop"."mediateurs" m2
LEFT JOIN (
  SELECT mediateur_id, count(*)::int AS activites, sum(accompagnements_count)::int AS accompagnements
  FROM "coop"."activites" WHERE suppression IS NULL GROUP BY 1
) a ON a.mediateur_id = m2.id
LEFT JOIN (
  SELECT mediateur_id, count(*)::int AS beneficiaires
  FROM "coop"."beneficiaires" WHERE suppression IS NULL GROUP BY 1
) b ON b.mediateur_id = m2.id
WHERE m.id = m2.id
  AND (m.activites_count, m.accompagnements_count, m.beneficiaires_count)
    IS DISTINCT FROM (coalesce(a.activites, 0), coalesce(a.accompagnements, 0), coalesce(b.beneficiaires, 0));

UPDATE "coop"."lieu_inclusion" l
SET activites_count = coalesce(r.n, 0)
FROM "coop"."lieu_inclusion" l2
LEFT JOIN (
  SELECT structure_id, count(*)::int AS n FROM "coop"."activites"
  WHERE suppression IS NULL AND structure_id IS NOT NULL GROUP BY 1
) r ON r.structure_id = l2.id
WHERE l.id = l2.id AND l.activites_count IS DISTINCT FROM coalesce(r.n, 0);

UPDATE "coop"."tags" t
SET accompagnements_count = coalesce(r.n, 0) + coalesce(c.n, 0)
FROM "coop"."tags" t2
LEFT JOIN (
  SELECT at.tag_id, sum(a.accompagnements_count)::int AS n
  FROM "coop"."activite_tags" at JOIN "coop"."activites" a ON a.id = at.activite_id AND a.suppression IS NULL
  GROUP BY 1
) r ON r.tag_id = t2.id
LEFT JOIN (
  SELECT act.tag_id, count(*)::int AS n
  FROM "coop"."activite_coordination_tags" act JOIN "coop"."activite_coordination" a ON a.id = act.activite_coordination_id AND a.suppression IS NULL
  GROUP BY 1
) c ON c.tag_id = t2.id
WHERE t.id = t2.id AND t.accompagnements_count IS DISTINCT FROM coalesce(r.n, 0) + coalesce(c.n, 0);

SELECT set_config('coop.compteurs', '', false);
