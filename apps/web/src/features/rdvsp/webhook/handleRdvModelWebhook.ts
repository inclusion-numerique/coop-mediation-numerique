import type { RdvspWebhookRdvData, RdvspWebhookEvent } from './rdvWebhook'

export const handleRdvModelWebhook = async ({
  data,
  event,
}: {
  data: RdvspWebhookRdvData
  event: RdvspWebhookEvent
}) => {
  // TODO: Implement RDV webhook processing logic
  // Handle created, updated, destroyed events for RDV
  // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
  console.log(`[rdvsp webhook] Processing RDV ${event} for RDV id ${data.id}`)
}
