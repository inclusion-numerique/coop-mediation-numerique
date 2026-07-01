import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/** Identifiant de structure — référence cross-feature, brandé localement (AR-3). */
export const StructureId = defineModel(z.string().uuid().brand('StructureId'))

export type StructureId = Model.TypeOf<typeof StructureId>
