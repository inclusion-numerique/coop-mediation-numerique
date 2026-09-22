import { prismaClient } from '@app/web/prismaClient'
import type { LieuAReprendre, LireLesLieux } from '../../domain'

export const lireLesLieux: LireLesLieux = async () =>
  prismaClient.$queryRaw<LieuAReprendre[]>`
    SELECT
      id::text                                               AS "id",
      COALESCE(nom, '')                                      AS "nom",
      COALESCE(commune, '')                                  AS "commune",
      COALESCE(code_postal, '')                              AS "codePostal",
      COALESCE(visible_pour_cartographie_nationale, false)   AS "publie",
      COALESCE(typologies::text[], '{}')                     AS "typologies",
      COALESCE(services::text[], '{}')                       AS "services",
      COALESCE(modalites_acces::text[], '{}')                AS "modalitesAcces",
      COALESCE(modalites_accompagnement::text[], '{}')       AS "modalitesAccompagnement",
      COALESCE(publics_specifiquement_adresses::text[], '{}') AS "publicsSpecifiquementAdresses",
      COALESCE(prise_en_charge_specifique::text[], '{}')     AS "priseEnChargeSpecifique",
      COALESCE(frais_a_charge::text[], '{}')                 AS "fraisACharge",
      COALESCE(itinerance::text[], '{}')                     AS "itinerance",
      COALESCE(dispositif_programmes_nationaux::text[], '{}') AS "dispositifProgrammesNationaux",
      COALESCE(formations_labels::text[], '{}')              AS "formationsLabels",
      COALESCE(autres_formations_labels, '{}')               AS "autresFormationsLabels"
    FROM coop.lieu_inclusion
    WHERE suppression IS NULL
    ORDER BY creation
  `
