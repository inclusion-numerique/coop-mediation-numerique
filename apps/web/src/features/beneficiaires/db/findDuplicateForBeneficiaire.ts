import { prismaClient } from '@app/web/prismaClient'
import type { Beneficiaire } from '@prisma/client'
import { Prisma } from '@prisma/client'

type DuplicateBeneficiaire = {
  id: string
  nom: string | null
  prenom: string | null
  telephone: string | null
  email: string | null
  creation: Date
}

/**
 * Finds duplicate beneficiaires for a given beneficiaire based on matching fields.
 * Requires at least 3 out of 4 fields to match (nom, prenom, telephone, email).
 * Uses normalized search to handle accents and spacing differences.
 */
export const findDuplicateForBeneficiaire = async (
  beneficiaire: Pick<
    Beneficiaire,
    'id' | 'nom' | 'prenom' | 'telephone' | 'email' | 'mediateurId'
  >,
): Promise<DuplicateBeneficiaire[]> => {
  // Find duplicates by comparing normalized fields
  // Requires at least 3 matching fields out of: nom, prenom, telephone, email
  const duplicates = await prismaClient.$queryRaw<DuplicateBeneficiaire[]>`
    WITH "target" AS (
      SELECT
        ${beneficiaire.id}::uuid as id,
        ${beneficiaire.nom} as nom,
        ${beneficiaire.prenom} as prenom,
        ${beneficiaire.telephone} as telephone,
        ${beneficiaire.email} as email,
        lower(unaccent(${beneficiaire.nom})) as nom_search,
        lower(unaccent(${beneficiaire.prenom})) as prenom_search,
        lower(regexp_replace(unaccent(${beneficiaire.telephone}), '\\s', '', 'g')) as telephone_search,
        lower(unaccent(${beneficiaire.email})) as email_search
    ),
    "candidates" AS (
      SELECT
        id,
        nom,
        prenom,
        telephone,
        email,
        creation,
        lower(unaccent(nom)) as nom_search,
        lower(unaccent(prenom)) as prenom_search,
        lower(regexp_replace(unaccent(telephone), '\\s', '', 'g')) as telephone_search,
        lower(unaccent(email)) as email_search
      FROM "beneficiaires"
      WHERE mediateur_id = ${beneficiaire.mediateurId}::uuid 
       /* and email or telephone are not null nor empty strings */
        AND anonyme = false
        AND id != ${beneficiaire.id}::uuid
        AND (
            (email IS NOT NULL AND email != '' )
            OR (telephone IS NOT NULL AND telephone != ''))
    )
    SELECT
      c.id,
      c.nom,
      c.prenom,
      c.telephone,
      c.email,
      c.creation
    FROM "candidates" c
    CROSS JOIN "target" t
    WHERE (
      (CASE WHEN t.nom_search IS NOT NULL AND c.nom_search IS NOT NULL AND t.nom_search = c.nom_search THEN 1 ELSE 0 END) +
      (CASE WHEN t.prenom_search IS NOT NULL AND c.prenom_search IS NOT NULL AND t.prenom_search = c.prenom_search THEN 1 ELSE 0 END) +
      (CASE WHEN t.telephone_search IS NOT NULL AND c.telephone_search IS NOT NULL AND t.telephone_search = c.telephone_search THEN 1 ELSE 0 END) +
      (CASE WHEN t.email_search IS NOT NULL AND c.email_search IS NOT NULL AND t.email_search = c.email_search THEN 1 ELSE 0 END)
    ) >= 3
    ORDER BY c.nom ASC, c.creation DESC
  `

  return duplicates
}
