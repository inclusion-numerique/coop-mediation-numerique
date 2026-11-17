import { z } from 'zod'
import {
  EvenementWebhook,
  evenementsWebhook,
} from '../../domain/evenement-webhook'
import type { NotificationWebhook } from '../../domain/notification-webhook'

const enveloppePayload = z.object({
  data: z.unknown(),
  meta: z.object({
    model: z.string(),
    event: z.enum(evenementsWebhook),
  }),
})

/**
 * Lit l'enveloppe d'une notification, sans rien affirmer de son contenu :
 * chaque ability valide la forme de `data` qu'elle attend.
 *
 * Rend `null` quand l'enveloppe elle-même est illisible — c'est le seul cas qui
 * justifie de refuser l'envoi.
 */
export const lireNotificationWebhook = (
  corps: unknown,
): NotificationWebhook | null => {
  const analyse = enveloppePayload.safeParse(corps)

  if (!analyse.success) {
    return null
  }

  const { model, event } = analyse.data.meta
  const evenement = EvenementWebhook(event)

  if (model === 'Rdv') {
    return { _tag: 'rdv', evenement, donnees: analyse.data.data }
  }

  return model === 'User'
    ? { _tag: 'usager', evenement, donnees: analyse.data.data }
    : { _tag: 'ignoree', modele: model }
}
