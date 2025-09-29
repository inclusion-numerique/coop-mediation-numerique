import { prismaClient } from '@app/web/prismaClient'
import { UserMediateur } from '@app/web/utils/user'

export type BeneficiaireDoublon = {
  id: string // unique id for the duplicate object
  a: {
    id: string
    nom: string
    prenom: string
    telephone: string
    email: string
    creation: string
  }
  b: {
    id: string
    nom: string
    prenom: string
    telephone: string
    email: string
    creation: string
  }
}

export type BeneficiairesDoublonsPageData = {
  count: number
  duplicates: BeneficiaireDoublon[]
}

export const getBeneficiairesDoublonsPageData = async ({
  user,
}: {
  user: UserMediateur
}): Promise<BeneficiairesDoublonsPageData> => {
  if (!user.mediateur) {
    return {
      count: 0,
      duplicates: [] as BeneficiaireDoublon[],
    }
  }

  const rawDuplicates = await prismaClient.$queryRaw<
    {
      a_id: string
      a_nom: string
      a_prenom: string
      a_telephone: string
      a_email: string
      a_creation: string
      b_id: string
      b_nom: string
      b_prenom: string
      b_telephone: string
      b_email: string
      b_creation: string
    }[]
  >`
  WITH "all" AS (
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
    WHERE mediateur_id = ${user.mediateur.id}::uuid AND anonyme = false
    ORDER BY nom ASC, creation DESC
  )
  SELECT
    a.id as a_id,
    a.nom as a_nom,
    a.prenom as a_prenom,
    a.telephone as a_telephone,
    a.email as a_email,
    a.creation as a_creation,
    b.id as b_id,
    b.nom as b_nom,
    b.prenom as b_prenom,
    b.telephone as b_telephone,
    b.email as b_email,
    b.creation as b_creation
  FROM "all" a
  JOIN "all" b ON a.id < b.id
  WHERE (
    (CASE WHEN a.nom_search IS NOT NULL AND b.nom_search IS NOT NULL AND a.nom_search = b.nom_search THEN 1 ELSE 0 END) +
    (CASE WHEN a.prenom_search IS NOT NULL AND b.prenom_search IS NOT NULL AND a.prenom_search = b.prenom_search THEN 1 ELSE 0 END) +
    (CASE WHEN a.telephone_search IS NOT NULL AND b.telephone_search IS NOT NULL AND a.telephone_search = b.telephone_search THEN 1 ELSE 0 END) +
    (CASE WHEN a.email_search IS NOT NULL AND b.email_search IS NOT NULL AND a.email_search = b.email_search THEN 1 ELSE 0 END)
  ) >= 2
  ORDER BY a_nom ASC, b_nom ASC
  `

  const normalizedDuplicates = rawDuplicates.map(
    ({
      a_id,
      a_nom,
      a_prenom,
      a_telephone,
      a_email,
      b_id,
      b_nom,
      b_prenom,
      b_telephone,
      b_email,
      a_creation,
      b_creation,
    }) => ({
      id: `${a_id}-${b_id}`,
      a: {
        id: a_id,
        nom: a_nom,
        prenom: a_prenom,
        telephone: a_telephone,
        email: a_email,
        creation: a_creation,
      },
      b: {
        id: b_id,
        nom: b_nom,
        prenom: b_prenom,
        telephone: b_telephone,
        email: b_email,
        creation: b_creation,
      },
    }),
  )

  console.log('Duplicates', rawDuplicates)
  console.log('Normalized Duplicates', normalizedDuplicates)

  return {
    count: normalizedDuplicates.length,
    duplicates: normalizedDuplicates,
  }
}
