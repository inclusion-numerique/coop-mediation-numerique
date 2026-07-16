import { prismaClient } from '@app/web/prismaClient'
import type { LireFaitsInscription } from '../../domain/ports'

/**
 * Lit les faits d'inscription bruts requis par `valider`. Distinct de
 * `getInscriptionEtat` : ne collapse pas « profil posé, CGU absentes » en
 * `NonDemarree`, car dans le flow Dataspace les CGU sont posées à la validation.
 * La présence d'un compte de rôle est lue ici pour la garde anti-fantôme.
 */
export const lireFaitsInscription: LireFaitsInscription = async (userId) => {
  const row = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      profilInscription: true,
      acceptationCgu: true,
      inscriptionValidee: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
  })

  return {
    userId,
    profilChoisi: row?.profilInscription != null,
    compteDeRoleExiste: row?.mediateur != null || row?.coordinateur != null,
    dejaValidee: row?.inscriptionValidee != null,
    cguDejaAcceptee: row?.acceptationCgu != null,
  }
}
