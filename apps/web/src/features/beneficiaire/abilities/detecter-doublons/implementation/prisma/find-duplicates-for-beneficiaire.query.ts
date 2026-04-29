import { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import type {
  DuplicateBeneficiaire,
  FindDuplicatesForBeneficiaire,
} from '@app/web/features/beneficiaire/domain/ports'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import { prismaClient } from '@app/web/prismaClient'
import { Prisma } from '@prisma/client'

type RawDuplicate = {
  id: string
  nom: string | null
  prenom: string | null
  telephone: string | null
  email: string | null
  creation: Date
  anneeNaissance: number | null
  adresse: string | null
  commune: string | null
  communeCodePostal: string | null
  communeCodeInsee: string | null
}

const toCommuneResidence = (row: RawDuplicate): CommuneResidence | null =>
  row.commune && row.communeCodePostal && row.communeCodeInsee
    ? CommuneResidence({
        commune: row.commune,
        codePostal: row.communeCodePostal,
        codeInsee: row.communeCodeInsee,
        ...(row.adresse ? { adresse: row.adresse } : {}),
      })
    : null

const toDuplicateBeneficiaire = (row: RawDuplicate): DuplicateBeneficiaire => ({
  id: BeneficiaireId(row.id),
  nom: row.nom ? Nom(row.nom) : null,
  prenom: row.prenom ? Prenom(row.prenom) : null,
  telephone: row.telephone ? Telephone(row.telephone) : null,
  email: row.email ? Email(row.email) : null,
  creation: row.creation,
  anneeNaissance: row.anneeNaissance
    ? AnneeNaissance(row.anneeNaissance)
    : null,
  communeResidence: toCommuneResidence(row),
})

export const findDuplicatesForBeneficiaire: FindDuplicatesForBeneficiaire =
  async ({ beneficiaire, withConflictingFields, fuzzyMatching = false }) => {
    const conflictCheckClause =
      withConflictingFields === 'include'
        ? Prisma.sql`TRUE`
        : Prisma.sql`(
          (CASE WHEN t.nom_search IS NOT NULL AND c.nom_search IS NOT NULL AND t.nom_search != c.nom_search THEN 1 ELSE 0 END) +
          (CASE WHEN t.prenom_search IS NOT NULL AND c.prenom_search IS NOT NULL AND t.prenom_search != c.prenom_search THEN 1 ELSE 0 END) +
          (CASE WHEN t.telephone_search IS NOT NULL AND c.telephone_search IS NOT NULL AND t.telephone_search != c.telephone_search THEN 1 ELSE 0 END) +
          (CASE WHEN t.email_search IS NOT NULL AND c.email_search IS NOT NULL AND t.email_search != c.email_search THEN 1 ELSE 0 END)
        ) = 0`

    const nomMatchClause = fuzzyMatching
      ? Prisma.sql`(CASE WHEN t.nom_search IS NOT NULL AND c.nom_search IS NOT NULL AND similarity(t.nom_search, c.nom_search) > 0.4 THEN 1 ELSE 0 END)`
      : Prisma.sql`(CASE WHEN t.nom_search IS NOT NULL AND c.nom_search IS NOT NULL AND t.nom_search = c.nom_search THEN 1 ELSE 0 END)`

    const prenomMatchClause = fuzzyMatching
      ? Prisma.sql`(CASE WHEN t.prenom_search IS NOT NULL AND c.prenom_search IS NOT NULL AND similarity(t.prenom_search, c.prenom_search) > 0.4 THEN 1 ELSE 0 END)`
      : Prisma.sql`(CASE WHEN t.prenom_search IS NOT NULL AND c.prenom_search IS NOT NULL AND t.prenom_search = c.prenom_search THEN 1 ELSE 0 END)`

    const rows = await prismaClient.$queryRaw<RawDuplicate[]>`
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
        commune,
        commune_code_postal as "communeCodePostal",
        commune_code_insee as "communeCodeInsee",
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
      c.adresse,
      c.commune,
      c."communeCodePostal",
      c."communeCodeInsee"
    FROM "candidates" c
    CROSS JOIN "target" t
    WHERE
      (
        ${nomMatchClause} +
        ${prenomMatchClause} +
        (CASE WHEN t.telephone_search IS NOT NULL AND c.telephone_search IS NOT NULL AND t.telephone_search = c.telephone_search THEN 1 ELSE 0 END) +
        (CASE WHEN t.email_search IS NOT NULL AND c.email_search IS NOT NULL AND t.email_search = c.email_search THEN 1 ELSE 0 END)
      ) >= 2
      AND ${conflictCheckClause}
    ORDER BY c.nom ASC, c.creation DESC
  `

    return rows.map(toDuplicateBeneficiaire)
  }
