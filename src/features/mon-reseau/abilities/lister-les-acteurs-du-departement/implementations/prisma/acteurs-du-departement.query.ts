import type { Search } from '@arckit/resultset'
import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import { orderItemsByIndexedValues } from '@/libraries/collections'
import {
  ACTEUR,
  ACTEUR_VISIBLE,
  acteurConseillerNumerique,
  acteurDesCommunes,
  acteurDuDepartement,
  DEPUIS_LES_ACTEURS,
} from '../../../../implementations/prisma/acteur.sql'
import {
  acteurSelect,
  versActeur,
} from '../../../../implementations/prisma/acteur.transfer'
import type {
  CriteresActeurs,
  FiltreRole,
  ListerLesActeursDuDepartement,
} from '../../domain'

const normalisee = (expression: Prisma.Sql) =>
  Prisma.sql`NULLIF(regexp_replace(lower(unaccent(${expression})), '[\\s-]', '', 'g'), '')`

const correspondA = (recherche: Search) => {
  if (recherche === '') return Prisma.sql`TRUE`

  const cherchee = normalisee(Prisma.sql`${recherche}`)
  return Prisma.sql`(
    ${normalisee(ACTEUR.nom)} ILIKE '%' || ${cherchee} || '%'
    OR ${normalisee(ACTEUR.prenom)} ILIKE '%' || ${cherchee} || '%'
    OR lower(${ACTEUR.courriel}) ILIKE '%' || ${recherche} || '%'
    OR ${normalisee(Prisma.sql`${ACTEUR.prenom} || ${ACTEUR.nom}`)} ILIKE '%' || ${cherchee} || '%'
    OR ${normalisee(Prisma.sql`${ACTEUR.nom} || ${ACTEUR.prenom}`)} ILIKE '%' || ${cherchee} || '%'
  )`
}

const CONDITION_DU_ROLE = {
  conseiller_numerique: Prisma.sql`${acteurConseillerNumerique(true)} AND ${ACTEUR.mediateur} IS NOT NULL`,
  mediateur_numerique: Prisma.sql`${acteurConseillerNumerique(false)} AND ${ACTEUR.mediateur} IS NOT NULL`,
  coordinateur: Prisma.sql`${ACTEUR.coordinateur} IS NOT NULL`,
} as const

const aLeRole = (role: FiltreRole | null) => {
  if (role === null) return Prisma.sql`TRUE`
  const cle: keyof typeof CONDITION_DU_ROLE = role
  return CONDITION_DU_ROLE[cle]
}

const desCommunes = (communes: CriteresActeurs['communes']) =>
  communes.length === 0 ? Prisma.sql`TRUE` : acteurDesCommunes(communes)

const SENS_DU_TRI = {
  asc: Prisma.raw('ASC'),
  desc: Prisma.raw('DESC'),
} as const

export const acteursDuDepartement: ListerLesActeursDuDepartement = async (
  departement,
  criteres,
) => {
  const conditions = Prisma.sql`
      ${ACTEUR_VISIBLE}
      AND ${acteurDuDepartement(departement)}
      AND ${correspondA(criteres.recherche)}
      AND ${aLeRole(criteres.role)}
      AND ${desCommunes(criteres.communes)}
    `
  const sens = SENS_DU_TRI[criteres.tri.direction]
  const decalage = (criteres.page - 1) * criteres.pageSize

  const [identifiants, [compte]] = await Promise.all([
    prismaClient.$queryRaw<{ id: string }[]>`
        WITH acteurs AS (
          SELECT DISTINCT ON (${ACTEUR.id})
            ${ACTEUR.id} AS id,
            ${ACTEUR.nom} AS nom,
            ${ACTEUR.prenom} AS prenom
          ${DEPUIS_LES_ACTEURS}
          WHERE ${conditions}
        )
        SELECT id FROM acteurs
        ORDER BY nom ${sens}, prenom ${sens}, id ASC
        LIMIT ${criteres.pageSize} OFFSET ${decalage}
      `,
    prismaClient.$queryRaw<[{ total: number }]>`
        SELECT COUNT(DISTINCT ${ACTEUR.id})::integer AS total
        ${DEPUIS_LES_ACTEURS}
        WHERE ${conditions}
      `,
  ])

  const ids = identifiants.map(({ id }) => id)
  const lignes =
    ids.length === 0
      ? []
      : await prismaClient.user.findMany({
          where: { id: { in: ids } },
          select: acteurSelect,
        })
  const total = compte?.total ?? 0

  return {
    items: orderItemsByIndexedValues(lignes, ids)
      .map(versActeur)
      .filter((acteur) => acteur !== null),
    totalItems: total,
    currentPage: criteres.page,
    pageSize: criteres.pageSize,
  }
}
