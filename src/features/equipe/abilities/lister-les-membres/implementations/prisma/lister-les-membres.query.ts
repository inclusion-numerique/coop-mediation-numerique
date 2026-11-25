import type { Page, PageSize } from '@arckit/resultset'
import { prismaClient } from '@/configuration/prisma'
import { failure, type Result, success } from '@/libraries/result'
import {
  ConsultationNonAutorisee,
  CoordinateurId,
  CoordinateurIntrouvable,
  type CriteresEquipe,
  type Lecteur,
  type MediateurId,
  peutConsulterLEquipe,
} from '../../../../domain'
import {
  filtresEquipe,
  type LigneEquipeRow,
  lignesEquipeCte,
  type StatistiquesEquipeRow,
  statistiquesEquipeSql,
  triEquipe,
} from '../../../../implementations/prisma/ligne-equipe.sql'
import { toLignesEquipe } from '../../../../implementations/prisma/ligne-equipe.transfer'
import type { MembresDeLEquipe, StatistiquesEquipe } from '../../domain'
import { coordinateurDeLEquipe } from './coordinateur-de-l-equipe.query'

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

export const listerLesMembres = async ({
  coordinateurId,
  lecteur,
  criteres,
  page,
  pageSize,
  maintenant = new Date(),
}: {
  coordinateurId: CoordinateurId
  lecteur: Lecteur
  criteres: CriteresEquipe
  page: Page
  pageSize: PageSize
  maintenant?: Date
}): Promise<
  Result<MembresDeLEquipe, ConsultationNonAutorisee | CoordinateurIntrouvable>
> => {
  if (!peutConsulterLEquipe(lecteur)(coordinateurId))
    return failure(ConsultationNonAutorisee())

  const coordinateur = await coordinateurDeLEquipe(coordinateurId)
  if (coordinateur === null) return failure(CoordinateurIntrouvable())

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

  return success({
    coordinateur,
    items: [...toLignesEquipe(lignes)],
    statistiques,
    totalItems: comptage?.count ?? 0,
    currentPage: page,
    pageSize,
  })
}
