import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const ClientApiId = defineModel(z.guid().brand('ClientApiId'))

export type ClientApiId = Model.TypeOf<typeof ClientApiId>
