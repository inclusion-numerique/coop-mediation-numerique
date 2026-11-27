import type { EvenementWebhook } from './evenement-webhook'

export type NotificationWebhook =
  | {
      readonly _tag: 'rdv'
      readonly evenement: EvenementWebhook
      readonly donnees: unknown
    }
  | {
      readonly _tag: 'usager'
      readonly evenement: EvenementWebhook
      readonly donnees: unknown
    }
  | { readonly _tag: 'ignoree'; readonly modele: string }
