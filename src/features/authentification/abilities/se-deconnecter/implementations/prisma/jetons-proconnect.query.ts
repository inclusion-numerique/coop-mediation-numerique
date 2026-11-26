import { prismaClient } from '@/configuration/prisma'
import type { LireLesJetonsProconnect } from '../../domain/ports'
import { expirationDuJeton } from './expiration-du-jeton.transfer'

export const lireLesJetonsDuFournisseur =
  (fournisseur: string): LireLesJetonsProconnect =>
  async (utilisateurId) => {
    const compte = await prismaClient.account.findFirst({
      where: { userId: utilisateurId, provider: fournisseur },
      select: { id_token: true, refresh_token: true },
    })
    const idToken = compte?.id_token || null
    return {
      idToken:
        idToken === null
          ? null
          : { valeur: idToken, expiration: expirationDuJeton(idToken) },
      refreshToken: compte?.refresh_token || null,
    }
  }
