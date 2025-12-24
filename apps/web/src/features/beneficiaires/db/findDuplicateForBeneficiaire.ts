import { prismaClient } from '@app/web/prismaClient'
import type { Beneficiaire } from '@prisma/client'
import { Prisma } from '@prisma/client'

export type DuplicateBeneficiaire = {
  id: string
  nom: string | null
  prenom: string | null
  telephone: string | null
  email: string | null
  creation: Date
  anneeNaissance: number | null
  adresse: string | null
}

/**
 * Finds duplicate beneficiaires for a given beneficiaire based on matching fields.
 * Requires at least 2 out of 4 fields to match (nom, prenom, telephone, email).
 * Uses normalized search to handle accents and spacing differences.
 *
 * @param withConflictingFields - 'include': allows conflicts on non-matching fields (only requires 2 matches).
 *                                 'exclude': ensures no conflicting fields (both non-null but different).
 */
export const findDuplicateForBeneficiaire = async ({
  beneficiaire,
  withConflictingFields,
}: {
  beneficiaire: Pick<
    Beneficiaire,
    'nom' | 'prenom' | 'telephone' | 'email' | 'mediateurId'
  > & { id: string | null }
  withConflictingFields: 'include' | 'exclude'
}): Promise<DuplicateBeneficiaire[]> => {
  // Build the conflict check clause conditionally based on withConflictingFields
  const conflictCheckClause =
    withConflictingFields === 'include'
      ? Prisma.sql`TRUE`
      : Prisma.sql`(
          (CASE WHEN t.nom_search IS NOT NULL AND c.nom_search IS NOT NULL AND t.nom_search != c.nom_search THEN 1 ELSE 0 END) +
          (CASE WHEN t.prenom_search IS NOT NULL AND c.prenom_search IS NOT NULL AND t.prenom_search != c.prenom_search THEN 1 ELSE 0 END) +
          (CASE WHEN t.telephone_search IS NOT NULL AND c.telephone_search IS NOT NULL AND t.telephone_search != c.telephone_search THEN 1 ELSE 0 END) +
          (CASE WHEN t.email_search IS NOT NULL AND c.email_search IS NOT NULL AND t.email_search != c.email_search THEN 1 ELSE 0 END)
        ) = 0`

  const duplicates = await prismaClient.$queryRaw<DuplicateBeneficiaire[]>`
    WITH "target" AS (
      SELECT
        ${beneficiaire.nom} as nom,
        ${beneficiaire.prenom} as prenom,
        ${beneficiaire.telephone} as telephone,
        ${beneficiaire.email} as email,
        NULLIF(regexp_replace(lower(unaccent(${beneficiaire.nom})), '[\\s-]', '', 'g'), '') as nom_search,
        NULLIF(regexp_replace(lower(unaccent(${beneficiaire.prenom})), '[\\s-]', '', 'g'), '') as prenom_search,
        NULLIF(lower(regexp_replace(unaccent(${beneficiaire.telephone}), '\\s', '', 'g')), '') as telephone_search,
        NULLIF(TRIM(lower(unaccent(${beneficiaire.email}))), '') as email_search
    ),
    "candidates" AS (
      SELECT
        id,
        nom,
        prenom,
        telephone,
        email,
        creation,
        annee_naissance as "anneeNaissance",
        adresse,
        NULLIF(regexp_replace(lower(unaccent(nom)), '[\\s-]', '', 'g'), '') as nom_search,
        NULLIF(regexp_replace(lower(unaccent(prenom)), '[\\s-]', '', 'g'), '') as prenom_search,
        NULLIF(lower(regexp_replace(unaccent(telephone), '\\s', '', 'g')), '') as telephone_search,
        NULLIF(TRIM(lower(unaccent(email))), '') as email_search
      FROM "beneficiaires"
      WHERE mediateur_id = ${beneficiaire.mediateurId}::uuid 
        AND suppression IS NULL
        AND anonyme = false
        ${beneficiaire.id ? Prisma.sql`AND id != ${beneficiaire.id}::uuid` : Prisma.sql``}
    )
    SELECT
      c.id,
      c.nom,
      c.prenom,
      c.telephone,
      c.email,
      c.creation,
      c."anneeNaissance",
      c.adresse
    FROM "candidates" c
    CROSS JOIN "target" t
    WHERE 
      /* At least 2 matching fields (null fields don't count as matches) */
      (
        (CASE WHEN t.nom_search IS NOT NULL AND c.nom_search IS NOT NULL AND t.nom_search = c.nom_search THEN 1 ELSE 0 END) +
        (CASE WHEN t.prenom_search IS NOT NULL AND c.prenom_search IS NOT NULL AND t.prenom_search = c.prenom_search THEN 1 ELSE 0 END) +
        (CASE WHEN t.telephone_search IS NOT NULL AND c.telephone_search IS NOT NULL AND t.telephone_search = c.telephone_search THEN 1 ELSE 0 END) +
        (CASE WHEN t.email_search IS NOT NULL AND c.email_search IS NOT NULL AND t.email_search = c.email_search THEN 1 ELSE 0 END)
      ) >= 2
      /* Conditionally check for conflicts: if withConflictingFields is 'exclude', ensure no conflicting fields */
      AND ${conflictCheckClause}
    ORDER BY c.nom ASC, c.creation DESC
  `

  return duplicates
}
