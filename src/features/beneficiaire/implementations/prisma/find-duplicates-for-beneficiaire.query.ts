import { prismaClient } from '@/configuration/prisma'
import { signaler } from '@/configuration/telemetry/serveur'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { DuplicateBeneficiaire } from '@/features/beneficiaire/domain/doublon-de-beneficiaire'
import type { Email } from '@/features/beneficiaire/domain/email'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { Nom } from '@/features/beneficiaire/domain/nom'
import type { Prenom } from '@/features/beneficiaire/domain/prenom'
import { Prisma } from '@/generated/prisma/client'
import { onlyDefinedAndNotNull } from '@/libraries/collections'
import type { Telephone } from '@/libraries/telephone'
import {
  doublonLu,
  type LigneDeDoublon,
  valeurInvalideDuDoublonEnErreur,
} from './doublon-de-beneficiaire.transfer'

export type FindDuplicatesForBeneficiaireInput = {
  beneficiaire: {
    id: BeneficiaireId | null
    nom: Nom | null
    prenom: Prenom | null
    telephone: Telephone | null
    email: Email | null
    mediateurId: MediateurId
  }
  withConflictingFields: 'include' | 'exclude'
  fuzzyMatching?: boolean
  maintenant: Date
}

const doublonSignale =
  (maintenant: Date) =>
  (ligne: LigneDeDoublon): DuplicateBeneficiaire | null => {
    const { doublon, invalides } = doublonLu(ligne, maintenant)
    invalides.map(valeurInvalideDuDoublonEnErreur(ligne.id)).forEach(signaler)
    return doublon
  }

export const findDuplicatesForBeneficiaire = async ({
  beneficiaire,
  withConflictingFields,
  fuzzyMatching = false,
  maintenant,
}: FindDuplicatesForBeneficiaireInput): Promise<DuplicateBeneficiaire[]> => {
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

  const rows = await prismaClient.$queryRaw<LigneDeDoublon[]>`
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

  return rows.map(doublonSignale(maintenant)).filter(onlyDefinedAndNotNull)
}
