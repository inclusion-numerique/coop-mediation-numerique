import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const LienDePartageId = defineModel(z.guid().brand('LienDePartageId'))

export type LienDePartageId = Model.TypeOf<typeof LienDePartageId>
