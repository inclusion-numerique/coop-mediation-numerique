import { prismaClient } from '@/configuration/prisma'
import { UtilisateurId } from '../../../../domain'
import { type LigneContrat, TypeContrat } from '../../domain'
import type { LireLesContratsDesMembres } from '../../domain/ports'

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

export const lireLesContratsDesMembres: LireLesContratsDesMembres = async (
  utilisateurIds,
) => {
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
    personnes.flatMap(({ coopId, contrats }) =>
      coopId === null
        ? []
        : [[UtilisateurId(coopId), contrats.map(toLigneContrat)]],
    ),
  )
}
