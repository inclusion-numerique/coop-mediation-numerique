import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Le médiateur appartient à une autre feature : on n'en connaît ici que
 * l'identité, dupliquée localement plutôt qu'importée (AR-2/IS-1).
 */
export const MediateurId = defineModel(z.string().uuid().brand('MediateurId'))

export type MediateurId = Model.TypeOf<typeof MediateurId>
