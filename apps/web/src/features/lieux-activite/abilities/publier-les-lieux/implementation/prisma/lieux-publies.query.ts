import { conseillersNumeriquesUserIdsSql } from '@app/web/features/employeuse/server'
import { prismaClient } from '@app/web/prismaClient'
import type { LieuMediationNumerique } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { Prisma } from '@prisma/client'

/**
 * Un médiateur tel que la cartographie nationale l'affiche sur le lieu.
 *
 * Seuls y figurent ceux qui ont accepté d'être visibles : la carte publie un
 * nom et un moyen de contact, ce qui ne se présume pas.
 */
export type Aidant = {
  id: string
  nom: string
  courriel: string
  telephone?: string
}

/**
 * Les lieux que la coop publie sur la cartographie nationale.
 *
 * Trois conditions, et elles se cumulent : le lieu n'est pas supprimé, il est
 * déclaré visible pour la cartographie, et au moins un médiateur visible y
 * exerce encore. Un lieu sans personne n'est pas un lieu d'accueil.
 *
 * La requête est écrite en SQL brut parce qu'elle produit directement la forme
 * du schéma national — objets d'adresse, de localisation, de contact, de
 * présentation — que `jsonb_build_object` assemble bien mieux qu'une
 * projection en mémoire sur 12 000 lignes.
 *
 * Le dispositif conseiller numérique se dérive de `main` (affectation idposte
 * active), et non d'une colonne de la coop.
 */
export const lieuxPublies = async ({
  ids,
  dispositifProgrammeNational,
}: {
  readonly ids: readonly string[]
  readonly dispositifProgrammeNational?: string
}) => {
  return prismaClient.$queryRaw<
    (LieuMediationNumerique & { aidants?: Aidant[] })[]
  >`
  WITH base AS (
    SELECT structures.id,
      COALESCE(NULLIF(structures.siret, ''), NULLIF(structures.rna, ''), '00000000000000') AS pivot,
      structures.nom,
      jsonb_strip_nulls(
        jsonb_build_object(
          'voie', structures.adresse,
          'complement_adresse', NULLIF(structures.complement_adresse, ''),
          'code_postal', structures.code_postal,
          'code_insee', structures.code_insee,
          'commune', structures.commune
        )
      ) AS adresse,
      jsonb_strip_nulls(
        jsonb_build_object(
          'latitude', structures.latitude,
          'longitude', structures.longitude
        )
      ) AS localisation,
      NULLIF(structures.typologies, '{}') AS typologies,
      jsonb_strip_nulls(
        jsonb_build_object(
          'telephone', NULLIF(structures.telephone, ''),
          'courriels', NULLIF(structures.courriels, '{}'),
          'site_web', CASE WHEN NULLIF(structures.site_web, '') IS NOT NULL THEN ARRAY[structures.site_web] END
        )
      ) AS contact,
      NULLIF(structures.horaires, '') AS horaires,
      jsonb_strip_nulls(
        jsonb_build_object(
          'resume', NULLIF(structures.presentation_resume, ''),
          'detail', NULLIF(structures.presentation_detail, '')
        )
      ) AS presentation,
      'Coop numérique' AS source,
      structures.itinerance,
      NULLIF(structures.itinerance, '{}') AS itinerance, structures.modification as "date_maj",
      NULLIF(structures.services, '{}') AS services,
      NULLIF(structures.structure_parente, '{}') AS structure_parente,
      NULLIF(structures.publics_specifiquement_adresses, '{}') AS publics_specifiquement_adresses,
      NULLIF(structures.prise_en_charge_specifique, '{}') AS prise_en_charge_specifique,
      NULLIF(structures.frais_a_charge, '{}') AS frais_a_charge,
        CASE
          WHEN COUNT(CASE WHEN conseillers.user_id IS NOT NULL THEN 1 END) > 0 THEN ARRAY['Conseillers numériques']
        END
      AS dispositif_programmes_nationaux,
      NULLIF(structures.formations_labels, '{}') AS formations_labels,
      NULLIF(structures.autres_formations_labels, '{}') AS autres_formations_labels,
      NULLIF(structures.modalites_acces, '{}') AS modalites_acces,
      NULLIF(structures.modalites_accompagnement, '{}') AS modalites_accompagnement,
      NULLIF(structures.fiche_acces_libre, '') AS fiche_acces_libre,
      NULLIF(structures.prise_rdv, '') AS prise_rdv,
      COALESCE(
          jsonb_agg(
            jsonb_strip_nulls(jsonb_build_object(
              'nom', users.name,
              'courriel', users.email,
              'telephone', NULLIF(users.phone, ''),
              'id', users.id
            ))
          ) FILTER (WHERE users.id IS NOT NULL),
          '[]'::jsonb
        ) AS aidants
      FROM lieu_inclusion structures
        LEFT JOIN mediateurs_en_activite mediateurs_en_activite  ON structures.id = mediateurs_en_activite.structure_id
        LEFT JOIN mediateurs ON mediateurs_en_activite.mediateur_id = mediateurs.id AND mediateurs.is_visible = TRUE
        LEFT JOIN users ON mediateurs.user_id = users.id
        -- Dispositif conseiller numérique dérivé de main (affectation idposte active) : un
        -- ensemble d'identifiants distincts, donc une jointure qui ne démultiplie aucune ligne
        -- de l'agrégat.
        LEFT JOIN (${conseillersNumeriquesUserIdsSql}) conseillers ON conseillers.user_id = users.id
    WHERE structures.suppression IS NULL
      AND mediateurs_en_activite.suppression IS NULL AND mediateurs_en_activite.fin_activite IS NULL
      AND structures.visible_pour_cartographie_nationale IS true
      AND users.deleted IS NULL
    GROUP BY structures.id
  )
  SELECT *
  FROM base
      ${
        ids.length > 0 || dispositifProgrammeNational
          ? Prisma.sql`WHERE ${
              ids.length > 0
                ? Prisma.sql`id IN (${Prisma.join(ids.map((id) => Prisma.sql`${id}::uuid`))})`
                : Prisma.empty
            } ${
              ids.length > 0 && dispositifProgrammeNational
                ? Prisma.sql`AND`
                : Prisma.empty
            } ${
              dispositifProgrammeNational
                ? Prisma.sql`${dispositifProgrammeNational}::text = ANY(dispositif_programmes_nationaux)`
                : Prisma.empty
            }`
          : Prisma.empty
      }
  `
}
