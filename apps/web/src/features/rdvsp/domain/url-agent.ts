import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Lien de consultation du rendez-vous dans l'interface agent de RDV Service
 * Public. Obligatoire côté base (`rdvs.url_for_agents`) alors que la
 * spécification publique ne le décrit que dans ses exemples de réponse : on le
 * valide donc ici plutôt que de faire confiance au payload.
 */
export const UrlAgent = defineModel(z.string().url().brand('UrlAgent'))

export type UrlAgent = Model.TypeOf<typeof UrlAgent>
