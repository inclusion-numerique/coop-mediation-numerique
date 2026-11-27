import { getServerUrl } from '@/configuration/projet/serveur'
import type { DestinationDesWebhooksJoignable } from '../../domain/ports'

const webhookUrl = getServerUrl('/api/rdv-service-public/webhook', {
  absolutePath: true,
})

export const destinationDesWebhooksJoignable: DestinationDesWebhooksJoignable =
  () => !webhookUrl.includes('localhost')
