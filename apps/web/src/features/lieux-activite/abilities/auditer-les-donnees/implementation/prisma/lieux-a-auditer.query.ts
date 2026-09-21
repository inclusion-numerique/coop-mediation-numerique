import { prismaClient } from '@app/web/prismaClient'
import type { LigneAAuditer } from '../../domain/anomalie'

/**
 * Les lieux tels que la base les porte, sans passer par le domaine.
 *
 * La lecture est en SQL brut, et c'est délibéré : le client Prisma décrit le
 * schéma d'APRÈS la migration, alors qu'on veut mesurer la base d'AVANT. Tout
 * revient en texte, y compris les vocabulaires, pour que le diagnostic compare
 * des valeurs du standard et non des noms de membres d'énumération.
 *
 * `site_web` est lu en texte : la colonne joint encore ses valeurs par « | » sur
 * une base qui n'a pas reçu la migration, et le diagnostic les découpe.
 */
export const lieuxAAuditer = async (): Promise<LigneAAuditer[]> =>
  prismaClient.$queryRaw<LigneAAuditer[]>`
    SELECT
      id::text                                       AS "id",
      COALESCE(nom, '')                              AS "nom",
      NULLIF(siret, '')                              AS "siret",
      NULLIF(rna, '')                                AS "rna",
      COALESCE(adresse, '')                          AS "adresse",
      COALESCE(commune, '')                          AS "commune",
      COALESCE(code_postal, '')                      AS "codePostal",
      NULLIF(code_insee, '')                         AS "codeInsee",
      NULLIF(complement_adresse, '')                 AS "complementAdresse",
      NULLIF(ban_id, '')                             AS "banId",
      latitude                                       AS "latitude",
      longitude                                      AS "longitude",
      NULLIF(telephone, '')                          AS "telephone",
      COALESCE(courriels, '{}')                      AS "courriels",
      NULLIF(site_web::text, '')                     AS "siteWeb",
      NULLIF(horaires, '')                           AS "horaires",
      NULLIF(presentation_resume, '')                AS "presentationResume",
      NULLIF(presentation_detail, '')                AS "presentationDetail",
      NULLIF(fiche_acces_libre, '')                  AS "ficheAccesLibre",
      NULLIF(prise_rdv, '')                          AS "priseRdv",
      COALESCE(typologies::text[], '{}')             AS "typologies",
      COALESCE(services::text[], '{}')               AS "services",
      COALESCE(modalites_acces::text[], '{}')        AS "modalitesAcces",
      COALESCE(modalites_accompagnement::text[], '{}') AS "modalitesAccompagnement",
      COALESCE(publics_specifiquement_adresses::text[], '{}') AS "publicsSpecifiquementAdresses",
      COALESCE(prise_en_charge_specifique::text[], '{}') AS "priseEnChargeSpecifique",
      COALESCE(frais_a_charge::text[], '{}')         AS "fraisACharge",
      COALESCE(itinerance::text[], '{}')             AS "itinerance",
      COALESCE(dispositif_programmes_nationaux::text[], '{}') AS "dispositifProgrammesNationaux",
      COALESCE(formations_labels::text[], '{}')      AS "formationsLabels",
      COALESCE(autres_formations_labels, '{}')       AS "autresFormationsLabels",
      COALESCE(visible_pour_cartographie_nationale, false) AS "visiblePourCartographieNationale"
    FROM coop.lieu_inclusion
    WHERE suppression IS NULL
    ORDER BY creation
  `
