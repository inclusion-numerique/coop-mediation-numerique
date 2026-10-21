import { prismaClient } from '@app/web/prismaClient'
import type { UtilisateurId } from '../../../../domain'
import {
  type ContratMembre,
  contratEnCours,
  type LigneContrat,
  TypeContrat,
} from '../../domain'

type ContratRow = {
  readonly type: string | null
  readonly dateDebut: Date | null
  readonly dateFin: Date | null
  readonly dateRupture: Date | null
}

const toLigneContrat = (row: ContratRow): LigneContrat => ({
  type: TypeContrat.safe(row.type) ?? TypeContrat('NonCommunique'),
  debut: row.dateDebut,
  fin: row.dateFin,
  rompuLe: row.dateRupture,
})

export const contratsDesMembres = async (
  utilisateurIds: readonly UtilisateurId[],
  maintenant: Date,
): Promise<ReadonlyMap<string, ContratMembre>> => {
  if (utilisateurIds.length === 0) return new Map()

  const personnes = await prismaClient.personneMain.findMany({
    where: { coopId: { in: [...utilisateurIds] } },
    select: {
      coopId: true,
      contrats: {
        select: {
          type: true,
          dateDebut: true,
          dateFin: true,
          dateRupture: true,
        },
      },
    },
  })

  return new Map(
    personnes.flatMap(({ coopId, contrats }) => {
      const contrat = contratEnCours(contrats.map(toLigneContrat), maintenant)
      return coopId === null || contrat === null ? [] : [[coopId, contrat]]
    }),
  )
}
