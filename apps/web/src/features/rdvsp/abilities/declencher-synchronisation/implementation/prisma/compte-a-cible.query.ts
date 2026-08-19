import { prismaClient } from '@app/web/prismaClient'
import { compteRdvToDomain } from '../../../../db'
import type { CompteACible } from '../../domain/declencher-synchronisation'

/**
 * La cible est désignée par son identifiant La Coop : c'est ce que porte
 * l'écran d'administration, qui déclenche pour un tiers.
 */
export const compteACible: CompteACible = async (utilisateurId) => {
  const row = await prismaClient.rdvAccount.findUnique({
    where: { userId: utilisateurId },
    include: { organisations: { select: { organisationId: true } } },
  })

  return row === null ? null : compteRdvToDomain(row)
}
