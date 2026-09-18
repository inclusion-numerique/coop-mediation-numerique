import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/** Référence locale vers l'entité coordinateur d'une autre feature (AR-3). */
export const CoordinateurId = defineModel(z.guid().brand('CoordinateurId'))

export type CoordinateurId = Model.TypeOf<typeof CoordinateurId>
