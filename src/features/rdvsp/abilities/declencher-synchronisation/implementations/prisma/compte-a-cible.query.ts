import { prismaClient } from '@/configuration/prisma'
import { compteRdvToDomain } from '../../../../implementations/prisma/compte-rdv.transfer'
import type { CompteACible } from '../../domain/ports'

/**
 * La cible est désignée par son identifiant La Coop : c'est ce que porte
 * l'écran d'administration, qui déclenche pour un tiers.
 */
export const compteACible: CompteACible = async (utilisateurId) => {
  const row = await prismaClient.rdvAccount.findUnique({
    where: { userId: utilisateurId },
    include: {
      organisations: { select: { organisationId: true } },
      user: { select: { mediateur: { select: { id: true } } } },
    },
  })

  return row === null
    ? null
    : {
        compte: compteRdvToDomain(row),
        mediateurId: row.user.mediateur?.id ?? null,
      }
}
