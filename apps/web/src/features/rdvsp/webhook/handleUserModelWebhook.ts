import type { RdvspWebhookEvent, RdvspWebhookUserData } from './rdvWebhook'

export const handleUserModelWebhook = async ({
  data,
  event,
}: {
  data: RdvspWebhookUserData
  event: RdvspWebhookEvent
}) => {
  // TODO: Implement User/Agent/UserProfile webhook processing logic
  // Handle created, updated, destroyed events for User-related entities
  // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
  console.log(`[rdvsp webhook] Processing ${event}`)
}
