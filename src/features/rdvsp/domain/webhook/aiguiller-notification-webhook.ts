import type { EvenementWebhook } from './evenement-webhook'
import type { NotificationWebhook } from './notification-webhook'

type NotificationATraiter = {
  readonly evenement: EvenementWebhook
  readonly donnees: unknown
}

export type AiguillageWebhook<T> = {
  readonly traiterRdv: (notification: NotificationATraiter) => Promise<T>
  readonly traiterUsager: (notification: NotificationATraiter) => Promise<T>
  readonly journaliser: (message: string) => void
}

export const aiguillerNotificationWebhook =
  <T>({ traiterRdv, traiterUsager, journaliser }: AiguillageWebhook<T>) =>
  async (notification: NotificationWebhook): Promise<T | null> => {
    if (notification._tag === 'ignoree') {
      journaliser(`modèle non traité : ${notification.modele}`)
      return null
    }

    journaliser(`traitement d'une notification ${notification._tag}`)

    const { evenement, donnees } = notification

    return notification._tag === 'rdv'
      ? traiterRdv({ evenement, donnees })
      : traiterUsager({ evenement, donnees })
  }
