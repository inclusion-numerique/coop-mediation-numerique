-- CreateEnum
CREATE TYPE "typologie" AS ENUM ('ACI', 'ACIPHC', 'AFPA', 'AI', 'ASE', 'ASSO', 'ASSO_CHOMEUR', 'Autre', 'AVIP', 'BIB', 'CAARUD', 'CADA', 'CAF', 'CAP_EMPLOI', 'CAVA', 'CC', 'CCAS', 'CCONS', 'CD', 'CDAS', 'CFP', 'CHRS', 'CHU', 'CIAS', 'CIDFF', 'CITMET', 'CMP', 'CMS', 'CPAM', 'CPH', 'CS', 'CSAPA', 'CSC', 'DEETS', 'DEPT', 'DIPLP', 'E2C', 'EA', 'EATT', 'EI', 'EITI', 'ENM', 'EPCI', 'EPI', 'EPIDE', 'EPN', 'ES', 'ESAT', 'ESS', 'ETTI', 'EVS', 'FABLAB', 'FABRIQUE', 'FAIS', 'FT', 'GEIQ', 'HUDA', 'LA_POSTE', 'MDE', 'MDH', 'MDEF', 'MDPH', 'MDS', 'MJC', 'ML', 'MQ', 'MSA', 'MSAP', 'MUNI', 'OACAS', 'ODC', 'OF', 'OIL', 'OPCS', 'PAD', 'PENSION', 'PI', 'PIJ_BIJ', 'PIMMS', 'PJJ', 'PLIE', 'PREF', 'PREVENTION', 'REG', 'RELAIS_LECTURE', 'RESSOURCERIE', 'RFS', 'RS_FJT', 'SCP', 'SPIP', 'TIERS_LIEUX', 'UDAF');

-- CreateEnum
CREATE TYPE "service" AS ENUM ('Aide aux démarches administratives', 'Maîtrise des outils numériques du quotidien', 'Insertion professionnelle via le numérique', 'Utilisation sécurisée du numérique', 'Parentalité et éducation avec le numérique', 'Loisirs et créations numériques', 'Compréhension du monde numérique', 'Accès internet et matériel informatique', 'Acquisition de matériel informatique à prix solidaire');

-- CreateEnum
CREATE TYPE "public_specifiquement_adresse" AS ENUM ('Jeunes', 'Étudiants', 'Familles et/ou enfants', 'Seniors', 'Femmes');

-- CreateEnum
CREATE TYPE "prise_en_charge_specifique" AS ENUM ('Surdité', 'Handicaps moteurs', 'Handicaps mentaux', 'Illettrisme', 'Langues étrangères (anglais)', 'Langues étrangères (autres)', 'Déficience visuelle');

-- CreateEnum
CREATE TYPE "frais_a_charge" AS ENUM ('Gratuit', 'Gratuit sous condition', 'Payant');

-- CreateEnum
CREATE TYPE "dispositif_programme_national" AS ENUM ('Aidants Connect', 'Bibliothèques numérique de référence', 'Certification PIX', 'Conseillers numériques', 'Emmaüs Connect', 'France Services', 'Grande école du numérique', 'La Croix Rouge', 'Point d''accès numérique CAF', 'Promeneurs du net', 'Relais numérique (Emmaüs Connect)');

-- CreateEnum
CREATE TYPE "formation_label" AS ENUM ('Formé à « Mon Espace Santé »', 'Formé à « DUPLEX » (illettrisme)', 'Arnia/MedNum BFC (Bourgogne-Franche-Comté)', 'Collectif ressources et acteurs réemploi (Normandie)', 'Fabriques de Territoire', 'Les Éclaireurs du numérique (Drôme)', 'Mes Papiers (Métropole de Lyon)', 'ORDI 3.0', 'SUD LABS (PACA)');

-- CreateEnum
CREATE TYPE "itinerance" AS ENUM ('Itinérant', 'Fixe');

-- CreateEnum
CREATE TYPE "modalite_acces" AS ENUM ('Se présenter', 'Téléphoner', 'Contacter par mail', 'Prendre un RDV en ligne', 'Ce lieu n’accueille pas de public', 'Envoyer un mail avec une fiche de prescription');

-- CreateEnum
CREATE TYPE "modalite_accompagnement" AS ENUM ('En autonomie', 'Accompagnement individuel', 'Dans un atelier collectif', 'À distance');

-- Create new columns
ALTER TABLE "structures"
	ADD COLUMN "new_typologies" "typologie"[] DEFAULT ARRAY[]::"typologie"[],
	ADD COLUMN "new_services" "service"[] DEFAULT ARRAY[]::"service"[],
	ADD COLUMN "new_publics_specifiquement_adresses" "public_specifiquement_adresse"[] DEFAULT ARRAY[]::"public_specifiquement_adresse"[],
	ADD COLUMN "new_prise_en_charge_specifique" "prise_en_charge_specifique"[] DEFAULT ARRAY[]::"prise_en_charge_specifique"[],
	ADD COLUMN "new_frais_a_charge" "frais_a_charge"[] DEFAULT ARRAY[]::"frais_a_charge"[],
	ADD COLUMN "new_dispositif_programmes_nationaux" "dispositif_programme_national"[] DEFAULT ARRAY[]::"dispositif_programme_national"[],
	ADD COLUMN "new_itinerance" "itinerance"[] DEFAULT ARRAY[]::"itinerance"[],
	ADD COLUMN "new_modalites_acces" "modalite_acces"[] DEFAULT ARRAY[]::"modalite_acces"[],
	ADD COLUMN "new_modalites_accompagnement" "modalite_accompagnement"[] DEFAULT ARRAY[]::"modalite_accompagnement"[],
	ADD COLUMN "new_formations_labels" "formation_label"[] DEFAULT ARRAY[]::"formation_label"[];

-- Fix values
UPDATE "structures"
SET "services" = array_replace("services", 'Comprehension du monde numérique', 'Compréhension du monde numérique');
UPDATE structures
SET services = array_replace(services, 'Réaliser des démarches administratives avec un accompagnement', 'Aide aux démarches administratives');
UPDATE "structures"
SET "modalites_accompagnement" = array_replace("modalites_accompagnement", 'Dans un atelier collectif : j''apprends collectivement à utiliser le numérique', 'Dans un atelier collectif');
UPDATE "structures"
SET "modalites_accompagnement" = array_replace("modalites_accompagnement", 'À distance (par téléphone ou en visioconférence)', 'À distance');
UPDATE "structures"
SET "typologies" = subquery.new_typologies
FROM (
		 SELECT id, array_agg(t::typologie) AS new_typologies
		 FROM structures, LATERAL unnest(string_to_array(array_to_string(typologies, '|'), '|')) AS t
		 GROUP BY id
	 ) AS subquery
WHERE structures.id = subquery.id;

-- Copy data
UPDATE "structures"
SET
	"new_typologies" = "typologies"::"typologie"[],
	"new_services" = "services"::"service"[],
	"new_publics_specifiquement_adresses" = "publics_specifiquement_adresses"::"public_specifiquement_adresse"[],
	"new_prise_en_charge_specifique" = "prise_en_charge_specifique"::"prise_en_charge_specifique"[],
	"new_frais_a_charge" = "frais_a_charge"::"frais_a_charge"[],
	"new_dispositif_programmes_nationaux" = "dispositif_programmes_nationaux"::"dispositif_programme_national"[],
	"new_itinerance" = "itinerance"::"itinerance"[],
	"new_modalites_acces" = "modalites_acces"::"modalite_acces"[],
	"new_modalites_accompagnement" = "modalites_accompagnement"::"modalite_accompagnement"[],
	"new_formations_labels" = "formations_labels"::"formation_label"[];


-- Drop columns
ALTER TABLE "structures"
	DROP COLUMN "typologies",
	DROP COLUMN "services",
	DROP COLUMN "publics_specifiquement_adresses",
	DROP COLUMN "prise_en_charge_specifique",
	DROP COLUMN "frais_a_charge",
	DROP COLUMN "dispositif_programmes_nationaux",
	DROP COLUMN "itinerance",
	DROP COLUMN "modalites_acces",
	DROP COLUMN "modalites_accompagnement",
	DROP COLUMN "formations_labels";

-- Rename columns
ALTER TABLE "structures"
	RENAME COLUMN "new_typologies" TO "typologies";
ALTER TABLE "structures"
	RENAME COLUMN "new_services" TO "services";
ALTER TABLE "structures"
	RENAME COLUMN "new_publics_specifiquement_adresses" TO "publics_specifiquement_adresses";
ALTER TABLE "structures"
	RENAME COLUMN "new_prise_en_charge_specifique" TO "prise_en_charge_specifique";
ALTER TABLE "structures"
	RENAME COLUMN "new_frais_a_charge" TO "frais_a_charge";
ALTER TABLE "structures"
	RENAME COLUMN "new_dispositif_programmes_nationaux" TO "dispositif_programmes_nationaux";
ALTER TABLE "structures"
	RENAME COLUMN "new_itinerance" TO "itinerance";
ALTER TABLE "structures"
	RENAME COLUMN "new_modalites_acces" TO "modalites_acces";
ALTER TABLE "structures"
	RENAME COLUMN "new_modalites_accompagnement" TO "modalites_accompagnement";
ALTER TABLE "structures"
	RENAME COLUMN "new_formations_labels" TO "formations_labels";
