import type { EvenementWebhook } from './evenement-webhook'

/**
 * Notification reçue de RDV Service Public, une fois son enveloppe lue.
 *
 * `ignoree` est un cas nominal et non un échec : RDV Service Public notifie de
 * tous les modèles auxquels on s'abonne, dont certains n'intéressent que par
 * ricochet — un `Agent` ou un `UserProfile` ne déclenche aucun traitement. Les
 * distinguer d'une enveloppe illisible évite de rendre une erreur à un envoi
 * parfaitement conforme, ce qui ferait réessayer l'émetteur pour rien.
 */
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
