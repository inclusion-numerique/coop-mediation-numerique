import { environnementServeur } from '@/configuration/environnement/serveur'

const actif = environnementServeur().RDV_SERVICE_PUBLIC_WEBHOOK_DEBUG

export const journaliserWebhook = (message: string): void => {
  if (!actif) {
    return
  }

  // biome-ignore lint/suspicious/noConsole: journal de diagnostic, activé à la demande
  console.log(`[rdvsp webhook] ${message}`)
}
