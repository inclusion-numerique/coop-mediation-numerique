import type { UtilisateurId } from '@app/web/features/mediateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
import {
  type Contrat,
  dernierContrat,
  type LigneDeContrat,
  TypeDeContrat,
} from '../../domain'

export const consulterLeContrat = async ({
  utilisateurId,
  maintenant = new Date(),
}: {
  readonly utilisateurId: UtilisateurId
  readonly maintenant?: Date
}): Promise<Contrat | null> => {
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

  const lignes = (personne?.contrats ?? []).map(
    (contrat): LigneDeContrat => ({
      type: contrat.type == null ? null : TypeDeContrat.safe(contrat.type),
      debut: contrat.dateDebut,
      fin: contrat.dateFin,
      rupture: contrat.dateRupture,
    }),
  )

  return dernierContrat(lignes, maintenant)
}
