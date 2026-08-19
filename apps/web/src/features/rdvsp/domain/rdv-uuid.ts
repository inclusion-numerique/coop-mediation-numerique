import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Identifiant public d'un rendez-vous, distinct de son `RdvId` numérique.
 * C'est cette valeur que porte l'URL partagée au bénéficiaire.
 */
export const RdvUuid = defineModel(z.string().uuid().brand('RdvUuid'))

export type RdvUuid = Model.TypeOf<typeof RdvUuid>
