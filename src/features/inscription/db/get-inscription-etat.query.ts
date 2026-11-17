import { prismaClient } from '@app/web/prismaClient'
import type { GetInscriptionEtat } from '../domain/get-inscription-etat'
import { inscriptionEtatToDomain } from './inscription-etat.transfer'

/**
 * Reconstruit l'état d'inscription d'un utilisateur depuis sa ligne `user`.
 * Socle partagé par les abilities du parcours plutôt que dupliqué dans chacune :
 * la forme de ligne et le mapper vivent déjà ici.
 */
export const getInscriptionEtat: GetInscriptionEtat = async (userId) => {
  const row = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      profilInscription: true,
      acceptationCgu: true,
      structureEmployeuseRenseignee: true,
      lieuxActiviteRenseignes: true,
      inscriptionValidee: true,
    },
  })

  return row === null ? null : inscriptionEtatToDomain(row)
}
