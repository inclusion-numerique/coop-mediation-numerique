export enum RdvspWebhookModel {
  Rdv = 'Rdv',
  User = 'User',
  Agent = 'Agent',
  UserProfile = 'UserProfile',
}

export type RdvspWebhookEvent = 'created' | 'updated' | 'destroyed'

/**
 * Enveloppe d'une notification. Seul le `meta` est décrit ici : la route s'en
 * sert pour aiguiller, et chaque ability valide la forme de `data` qu'elle
 * attend. Les types de payload qui vivaient ici sont devenus des schémas, dans
 * les adaptateurs qui les lisent.
 */
export type RdvspWebhookPayload = {
  data: unknown
  meta: {
    model: RdvspWebhookModel
    event: RdvspWebhookEvent
    webhook_reason: string | null
    timestamp: string
  }
}
