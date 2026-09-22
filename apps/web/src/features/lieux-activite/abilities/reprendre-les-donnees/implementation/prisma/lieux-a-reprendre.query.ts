import { prismaClient } from '@app/web/prismaClient'
import type { LieuAReprendre, LireLesLieux } from '../../domain'

export const lireLesLieux: LireLesLieux = async () =>
  prismaClient.$queryRaw<LieuAReprendre[]>`
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
      COALESCE(site_web, '{}')                       AS "siteWeb",
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
      COALESCE(visible_pour_cartographie_nationale, false) AS "publie"
    FROM coop.lieu_inclusion
    WHERE suppression IS NULL
    ORDER BY creation
  `
