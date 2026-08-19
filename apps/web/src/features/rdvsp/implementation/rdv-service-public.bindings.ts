import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { prismaClient } from '@app/web/prismaClient'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { getServerUrl } from '@app/web/utils/baseUrl'
import { jetonsCompteToDomain } from '../db'
import { rdvServicePublicApi } from './api'

/**
 * Composition de l'adaptateur RDV Service Public avec la configuration de
 * l'application. Volontairement hors du baril de la feature : il tire la
 * configuration serveur et le client Prisma, qu'un composant client ne doit
 * jamais embarquer — `tsc` ne verrait pas la fuite, seul le build de production
 * la révélerait. Les appelants l'importent par ce chemin explicite.
 */
export const rdvServicePublicApiBinding = rdvServicePublicApi({
  hostname: PublicWebAppConfig.RdvServicePublic.OAuth.hostname,
  clientId: PublicWebAppConfig.RdvServicePublic.OAuth.clientId,
  clientSecret: ServerWebAppConfig.RdvServicePublic.OAuth.clientSecret,
  webhookUrl: getServerUrl('/api/rdv-service-public/webhook', {
    absolutePath: true,
  }),
  webhookSecret: ServerWebAppConfig.RdvServicePublic.webhookSecret,
  // Les jetons renouvelés au fil d'un appel sont persistés sans attendre : sans
  // cela, chaque requête repartirait du jeton périmé et rejouerait un échange.
  onJetonsRenouveles: async (agentId, jetons) => {
    await prismaClient.rdvAccount.update({
      where: { id: agentId },
      data: {
        accessToken: jetons.acces,
        refreshToken: jetons.rafraichissement,
        expiresAt: jetons.expiration,
        scope: jetons.portee,
      },
    })
  },
  // Contrepartie de l'écriture ci-dessus : sans cette lecture, un renouvellement
  // profite au seul appel qui l'a déclenché, et le suivant repart du jeton
  // périmé de l'instantané. Une passe de synchronisation en fait plusieurs.
  jetonsCourants: async (agentId) => {
    const compte = await prismaClient.rdvAccount.findUnique({
      where: { id: agentId },
      select: {
        accessToken: true,
        refreshToken: true,
        expiresAt: true,
        scope: true,
      },
    })

    return compte === null ? null : jetonsCompteToDomain(compte)
  },
})
