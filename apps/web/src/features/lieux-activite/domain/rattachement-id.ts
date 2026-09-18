import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const RattachementId = defineModel(z.guid().brand('RattachementId'))

export type RattachementId = Model.TypeOf<typeof RattachementId>
