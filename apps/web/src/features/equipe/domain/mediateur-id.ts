import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Référence locale vers l'entité médiateur d'une autre feature (AR-3) : équipe
 * a besoin de désigner qui détient un tag, sans importer le domaine voisin.
 */
export const MediateurId = defineModel(z.string().uuid().brand('MediateurId'))

export type MediateurId = Model.TypeOf<typeof MediateurId>
