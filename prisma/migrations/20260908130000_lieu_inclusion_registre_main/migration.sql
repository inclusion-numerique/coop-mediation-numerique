-- `main.lieu_inclusion` est le registre des lieux d'inclusion de l'Entrepôt : une ligne par
-- lieu, toutes sources confondues (moissonnage mednum-cli, MIN, coop), reliée au lieu coop par
-- `structure_coop_id`. Il est possédé par le Dataspace et géré par Flyway ; la coop ne fait que le
-- MODÉLISER pour pouvoir l'écrire et le lire.
--
-- La garde suit la règle posée par `20260820190000_personne_main_cn_pg_id` : la migration se garde
-- elle-même et ne s'inscrit PAS dans `MIGRATIONS_MAIN` (`prisma/baseline-main.sh`, registre fermé).
-- Elle est donc inerte partout où le DDL Dataspace est déjà posé — prod, restauration d'un dump
-- prod — et ne s'exécute que sur les bases où `main` vient de nos migrations : CI et environnements
-- de preview. Les énoncés d'une branche non prise ne sont jamais analysés : aucune DDL n'y est
-- posée, aucun verrou n'y est pris sur `main`, et l'absence de droit de propriété sur le schéma ne
-- se manifeste pas.
--
-- Deux écarts assumés avec la table réelle, dans la lignée de `20260722155232_baseline_main_external` :
--
--   - `updated_at` n'est pas créée. En prod c'est une colonne générée
--     (`GREATEST(updated_at_carto, updated_at_coop, updated_at_min)`), que Prisma ne sait pas
--     décrire ; la reproduire en colonne simple donnerait une valeur toujours nulle en test là où la
--     prod la calcule. La récence se dérive des trois horodatages de source, en code.
--   - L'index partiel `lieu_inclusion_visible_idx` n'est pas reproduit (non représentable par Prisma).
--
-- L'instantané `docker/initdb/01-dataspace-ddl.sql` porte, lui, une `main.lieu_inclusion` d'un stade
-- ANTÉRIEUR au registre : trente-deux colonnes, des `text[]` au lieu des énums, et aucun des trois
-- horodatages de source. La garde le détecte et lève, plutôt que de prendre cette table pour la
-- bonne et de sauter la création — une base docker neuve ferait alors tourner l'application sur des
-- colonnes absentes, en silence.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'main' AND t.typname = 'dispositif_programme_national') THEN
    CREATE TYPE main.dispositif_programme_national AS ENUM (
      'Aidants Connect',
      'Bibliothèques numérique de référence',
      'Certification PIX',
      'Conseillers numériques',
      'Emmaüs Connect',
      'France Services',
      'Grande école du numérique',
      'La Croix Rouge',
      'Point d''accès numérique CAF',
      'Promeneurs du net',
      'Relais numérique (Emmaüs Connect)'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'main' AND t.typname = 'formation_label') THEN
    CREATE TYPE main.formation_label AS ENUM (
      'Formé à « Mon Espace Santé »',
      'Formé à « DUPLEX » (illettrisme)',
      'Arnia/MedNum BFC (Bourgogne-Franche-Comté)',
      'Collectif ressources et acteurs réemploi (Normandie)',
      'Fabriques de Territoire',
      'Les Éclaireurs du numérique (Drôme)',
      'Mes Papiers (Métropole de Lyon)',
      'ORDI 3.0',
      'SUD LABS (PACA)'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'main' AND t.typname = 'frais_a_charge') THEN
    CREATE TYPE main.frais_a_charge AS ENUM (
      'Gratuit',
      'Gratuit sous condition',
      'Payant'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'main' AND t.typname = 'itinerance') THEN
    CREATE TYPE main.itinerance AS ENUM (
      'Itinérant',
      'Fixe'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'main' AND t.typname = 'modalite_acces') THEN
    CREATE TYPE main.modalite_acces AS ENUM (
      'Se présenter',
      'Téléphoner',
      'Contacter par mail',
      'Prendre un RDV en ligne',
      'Ce lieu n’accueille pas de public',
      'Envoyer un mail avec une fiche de prescription'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'main' AND t.typname = 'modalite_accompagnement') THEN
    CREATE TYPE main.modalite_accompagnement AS ENUM (
      'En autonomie',
      'Accompagnement individuel',
      'Dans un atelier collectif',
      'À distance'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'main' AND t.typname = 'prise_en_charge_specifique') THEN
    CREATE TYPE main.prise_en_charge_specifique AS ENUM (
      'Surdité',
      'Handicaps moteurs',
      'Handicaps mentaux',
      'Illettrisme',
      'Langues étrangères (anglais)',
      'Langues étrangères (autres)',
      'Déficience visuelle'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'main' AND t.typname = 'public_specifiquement_adresse') THEN
    CREATE TYPE main.public_specifiquement_adresse AS ENUM (
      'Jeunes',
      'Étudiants',
      'Familles et/ou enfants',
      'Seniors',
      'Femmes'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'main' AND t.typname = 'service') THEN
    CREATE TYPE main.service AS ENUM (
      'Aide aux démarches administratives',
      'Maîtrise des outils numériques du quotidien',
      'Insertion professionnelle via le numérique',
      'Utilisation sécurisée du numérique',
      'Parentalité et éducation avec le numérique',
      'Loisirs et créations numériques',
      'Compréhension du monde numérique',
      'Accès internet et matériel informatique',
      'Acquisition de matériel informatique à prix solidaire'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'main' AND t.typname = 'typologie') THEN
    CREATE TYPE main.typologie AS ENUM (
      'ACI',
      'ACIPHC',
      'AFPA',
      'AI',
      'ASE',
      'ASSO',
      'ASSO_CHOMEUR',
      'Autre',
      'AVIP',
      'BIB',
      'CAARUD',
      'CADA',
      'CAF',
      'CAP_EMPLOI',
      'CAVA',
      'CC',
      'CCAS',
      'CCONS',
      'CD',
      'CDAS',
      'CFP',
      'CHRS',
      'CHU',
      'CIAS',
      'CIDFF',
      'CITMET',
      'CMP',
      'CMS',
      'CPAM',
      'CPH',
      'CS',
      'CSAPA',
      'CSC',
      'DEETS',
      'DEPT',
      'DIPLP',
      'E2C',
      'EA',
      'EATT',
      'EI',
      'EITI',
      'ENM',
      'EPCI',
      'EPI',
      'EPIDE',
      'EPN',
      'ES',
      'ESAT',
      'ESS',
      'ETTI',
      'EVS',
      'FABLAB',
      'FABRIQUE',
      'FAIS',
      'FT',
      'GEIQ',
      'HUDA',
      'LA_POSTE',
      'MDE',
      'MDH',
      'MDEF',
      'MDPH',
      'MDS',
      'MJC',
      'ML',
      'MQ',
      'MSA',
      'MSAP',
      'MUNI',
      'OACAS',
      'ODC',
      'OF',
      'OIL',
      'OPCS',
      'PAD',
      'PENSION',
      'PI',
      'PIJ_BIJ',
      'PIMMS',
      'PJJ',
      'PLIE',
      'PREF',
      'PREVENTION',
      'REG',
      'RELAIS_LECTURE',
      'RESSOURCERIE',
      'RFS',
      'RS_FJT',
      'SCP',
      'SPIP',
      'TIERS_LIEUX',
      'UDAF'
    );
  END IF;

  IF to_regclass('main.lieu_inclusion') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'main' AND table_name = 'lieu_inclusion'
         AND column_name = 'updated_at_coop'
     ) THEN
    RAISE EXCEPTION 'main.lieu_inclusion est perimee : elle precede le registre (ni updated_at_coop, ni les enums main.*). Rafraichir docker/initdb/01-dataspace-ddl.sql, ou repartir d''une base vide.';
  END IF;

  IF to_regclass('main.lieu_inclusion') IS NULL THEN
    CREATE TABLE main.lieu_inclusion (
      id SERIAL NOT NULL,
      old_main_structure_id INTEGER,
      nom VARCHAR(255) NOT NULL,
      adresse_id INTEGER,
      structure_cartographie_nationale_id VARCHAR,
      visible_pour_cartographie_nationale BOOLEAN,
      fiche_acces_libre VARCHAR,
      presentation_resume TEXT,
      presentation_detail TEXT,
      horaires VARCHAR,
      prise_rdv VARCHAR,
      complement_adresse TEXT,
      nom_usage VARCHAR(255),
      itinerance main.itinerance[],
      services main.service[],
      modalites_acces main.modalite_acces[],
      modalites_accompagnement main.modalite_accompagnement[],
      publics_specifiquement_adresses main.public_specifiquement_adresse[],
      prise_en_charge_specifique main.prise_en_charge_specifique[],
      frais_a_charge main.frais_a_charge[],
      formations_labels main.formation_label[],
      autres_formations_labels TEXT[],
      dispositif_programmes_nationaux main.dispositif_programme_national[],
      typologies main.typologie[],
      contact JSONB,
      mediateurs_en_activite INTEGER,
      emplois INTEGER,
      source VARCHAR,
      edited_by VARCHAR(50),
      siret_a_l_enrichissement VARCHAR(14),
      structure_coop_id UUID,
      import_warnings JSONB,
      updated_at_carto TIMESTAMP(6),
      updated_at_coop TIMESTAMP(6),
      updated_at_min TIMESTAMP(6),
      created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP(6),

      CONSTRAINT lieu_inclusion_pkey PRIMARY KEY (id)
    );

    CREATE UNIQUE INDEX lieu_inclusion_old_main_structure_id_ukey ON main.lieu_inclusion(old_main_structure_id);
    CREATE UNIQUE INDEX lieu_inclusion_carto_id_ukey ON main.lieu_inclusion(structure_cartographie_nationale_id);
    CREATE UNIQUE INDEX lieu_inclusion_structure_coop_id_ukey ON main.lieu_inclusion(structure_coop_id);
    CREATE INDEX lieu_inclusion_adresse_id_idx ON main.lieu_inclusion(adresse_id);
    CREATE INDEX lieu_inclusion_nom_idx ON main.lieu_inclusion(nom);

    ALTER TABLE main.lieu_inclusion
      ADD CONSTRAINT lieu_inclusion_adresse_fkey
      FOREIGN KEY (adresse_id) REFERENCES main.adresse(id) ON DELETE NO ACTION ON UPDATE NO ACTION;
  END IF;
END $$;
