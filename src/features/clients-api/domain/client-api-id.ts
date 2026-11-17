import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const ClientApiId = defineModel(z.guid().brand('ClientApiId'))

export type ClientApiId = Model.TypeOf<typeof ClientApiId>
