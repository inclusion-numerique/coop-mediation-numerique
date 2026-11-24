import { prismaClient } from '@/configuration/prisma/prisma-client'
import { proConnectProviderId } from '@/features/authentification/implementations/proconnect/proconnect-provider-id.client'
import type { JetonsProconnect } from '../../domain'

export const jetonsProconnect = async (
  utilisateurId: string,
): Promise<JetonsProconnect> => {
  const compte = await prismaClient.account.findFirst({
    where: { userId: utilisateurId, provider: proConnectProviderId },
    select: { id_token: true, refresh_token: true },
  })
  return {
    idToken: compte?.id_token ?? null,
    refreshToken: compte?.refresh_token ?? null,
  }
}
