import { prismaClient } from '@/configuration/prisma'
import { type LigneDeContrat, TypeDeContrat } from '../../domain'
import type { LireLesContrats } from '../../domain/ports'

export const lireLesContrats: LireLesContrats = async (utilisateurId) => {
  const personne = await prismaClient.personneMain.findFirst({
    where: { coopId: utilisateurId },
    select: {
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

  return (personne?.contrats ?? []).map(
    (contrat): LigneDeContrat => ({
      type: contrat.type == null ? null : TypeDeContrat.safe(contrat.type),
      debut: contrat.dateDebut,
      fin: contrat.dateFin,
      rupture: contrat.dateRupture,
    }),
  )
}
