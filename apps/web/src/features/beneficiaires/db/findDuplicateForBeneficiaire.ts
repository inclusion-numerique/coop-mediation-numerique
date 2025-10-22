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
 * Also ensures there are no conflicting fields: if both beneficiaires have a non-null value
 * for a field, they must match. Uses normalized search to handle accents and spacing differences.
 */
export const findDuplicateForBeneficiaire = async (
  beneficiaire: Pick<
    Beneficiaire,
    'nom' | 'prenom' | 'telephone' | 'email' | 'mediateurId'
  > & { id: string | null },
): Promise<DuplicateBeneficiaire[]> => {
  // We don't want to compare the beneficiaire with itself
  const beneficiaireIdWhereClause = beneficiaire.id
    ? Prisma.sql`id != '${beneficiaire.id}'::uuid`
    : Prisma.sql`TRUE`

  const duplicates = await prismaClient.$queryRaw<DuplicateBeneficiaire[]>`
    WITH "target" AS (
      SELECT
        ${beneficiaire.nom} as nom,
        ${beneficiaire.prenom} as prenom,
        ${beneficiaire.telephone} as telephone,
        ${beneficiaire.email} as email,
        NULLIF(TRIM(lower(unaccent(${beneficiaire.nom}))), '') as nom_search,
        NULLIF(TRIM(lower(unaccent(${beneficiaire.prenom}))), '') as prenom_search,
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
        NULLIF(TRIM(lower(unaccent(nom))), '') as nom_search,
        NULLIF(TRIM(lower(unaccent(prenom))), '') as prenom_search,
        NULLIF(lower(regexp_replace(unaccent(telephone), '\\s', '', 'g')), '') as telephone_search,
        NULLIF(TRIM(lower(unaccent(email))), '') as email_search
      FROM "beneficiaires"
      WHERE mediateur_id = ${beneficiaire.mediateurId}::uuid 
        AND suppression IS NULL
        AND anonyme = false
        AND ${beneficiaireIdWhereClause}
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
      /* At least 2 matching fields */
      (
        (CASE WHEN t.nom_search IS NOT NULL AND c.nom_search IS NOT NULL AND t.nom_search = c.nom_search THEN 1 ELSE 0 END) +
        (CASE WHEN t.prenom_search IS NOT NULL AND c.prenom_search IS NOT NULL AND t.prenom_search = c.prenom_search THEN 1 ELSE 0 END) +
        (CASE WHEN t.telephone_search IS NOT NULL AND c.telephone_search IS NOT NULL AND t.telephone_search = c.telephone_search THEN 1 ELSE 0 END) +
        (CASE WHEN t.email_search IS NOT NULL AND c.email_search IS NOT NULL AND t.email_search = c.email_search THEN 1 ELSE 0 END)
      ) >= 2
      /* No conflicting fields (both non-null but different) */
      AND (
        (CASE WHEN t.nom_search IS NOT NULL AND c.nom_search IS NOT NULL AND t.nom_search != c.nom_search THEN 1 ELSE 0 END) +
        (CASE WHEN t.prenom_search IS NOT NULL AND c.prenom_search IS NOT NULL AND t.prenom_search != c.prenom_search THEN 1 ELSE 0 END) +
        (CASE WHEN t.telephone_search IS NOT NULL AND c.telephone_search IS NOT NULL AND t.telephone_search != c.telephone_search THEN 1 ELSE 0 END) +
        (CASE WHEN t.email_search IS NOT NULL AND c.email_search IS NOT NULL AND t.email_search != c.email_search THEN 1 ELSE 0 END)
      ) = 0
    ORDER BY c.nom ASC, c.creation DESC
  `

  return duplicates
}
