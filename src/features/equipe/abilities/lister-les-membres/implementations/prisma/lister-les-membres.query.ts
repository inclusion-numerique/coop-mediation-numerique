import { prismaClient } from '@/configuration/prisma'
import { CoordinateurId, type MediateurId } from '../../../../domain'
import {
  filtresEquipe,
  type LigneEquipeRow,
  lignesEquipeCte,
  type StatistiquesEquipeRow,
  statistiquesEquipeSql,
  triEquipe,
} from '../../../../implementations/prisma/ligne-equipe.sql'
import { toLigneEquipe } from '../../../../implementations/prisma/ligne-equipe.transfer'
import type { StatistiquesEquipe } from '../../domain'
import type { LireLesMembres } from '../../domain/ports'

const statistiquesVides: StatistiquesEquipe = {
  total: 0,
  actifs: 0,
  inactifs: 0,
  invitations: 0,
  archives: 0,
  conseillersNumeriques: 0,
}

export const compterLesMembres = async ({
  coordinateurId,
  maintenant = new Date(),
}: {
  coordinateurId: string
  maintenant?: Date
}): Promise<StatistiquesEquipe> => {
  const equipe = CoordinateurId.safe(coordinateurId)
  if (equipe === null) return statistiquesVides

  const [statistiques] = await prismaClient.$queryRaw<StatistiquesEquipeRow[]>`
    ${lignesEquipeCte({ coordinateurId: equipe, maintenant })}
    ${statistiquesEquipeSql}`

  return statistiques === undefined
    ? statistiquesVides
    : {
        total: statistiques.total,
        actifs: statistiques.actifs,
        inactifs: statistiques.inactifs,
        invitations: statistiques.invitations,
        archives: statistiques.archives,
        conseillersNumeriques: statistiques.conseillers_numeriques,
      }
}

export const estMembreActif = async ({
  mediateurId,
  coordinateurId,
}: {
  mediateurId: MediateurId | null
  coordinateurId: CoordinateurId
}): Promise<boolean> =>
  mediateurId !== null &&
  (await prismaClient.mediateurCoordonne.count({
    where: { mediateurId, coordinateurId, suppression: null },
  })) > 0

export const lireLesMembres: LireLesMembres = async ({
  coordinateurId,
  criteres,
  page,
  pageSize,
  maintenant,
}) => {
  const cte = lignesEquipeCte({ coordinateurId, maintenant })
  const filtres = filtresEquipe(criteres)

  const [lignes, [comptage], statistiques] = await Promise.all([
    prismaClient.$queryRaw<LigneEquipeRow[]>`
      ${cte}
      SELECT * FROM lignes
      ${filtres}
      ${triEquipe(criteres)}
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
    prismaClient.$queryRaw<{ count: number }[]>`
      ${cte}
      SELECT COUNT(*)::int AS count FROM lignes
      ${filtres}`,
    compterLesMembres({ coordinateurId, maintenant }),
  ])

  return {
    items: lignes.map(toLigneEquipe),
    statistiques,
    totalItems: comptage?.count ?? 0,
    currentPage: page,
    pageSize,
  }
}
