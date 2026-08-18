import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'

const actif = ServerWebAppConfig.RdvServicePublic.log.webhook.debug

/**
 * Journal des notifications reçues, éteint par défaut.
 *
 * Une ligne par notification, sur tous les rendez-vous et tous les usagers de
 * toutes les organisations : c'est utile le temps d'un diagnostic, et
 * intenable en continu. Le drapeau vivait déjà dans la configuration mais
 * n'était honoré que par la route, si bien que les traitements criaient ce que
 * la route taisait.
 *
 * Une seule fonction pour la route et les deux abilities, pour qu'il n'y ait
 * plus qu'un endroit où l'éteindre.
 */
export const journaliserWebhook = (message: string): void => {
  if (!actif) {
    return
  }

  // biome-ignore lint/suspicious/noConsole: journal de diagnostic, activé à la demande
  console.log(`[rdvsp webhook] ${message}`)
}
