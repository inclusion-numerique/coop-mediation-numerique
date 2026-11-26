import { getServerUrl } from '@/configuration/projet/serveur'
import type { DestinationDesWebhooksJoignable } from '../../domain/ports'

const webhookUrl = getServerUrl('/api/rdv-service-public/webhook', {
  absolutePath: true,
})

/**
 * En local, l'URL de destination n'est pas joignable depuis RDV Service Public :
 * poser le webhook enverrait des notifications dans le vide, et surtout
 * écraserait la pose de l'environnement qui porte réellement ce compte.
 */
export const destinationDesWebhooksJoignable: DestinationDesWebhooksJoignable =
  () => !webhookUrl.includes('localhost')
