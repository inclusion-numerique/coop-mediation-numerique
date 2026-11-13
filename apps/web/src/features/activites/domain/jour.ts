import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const Jour = defineModel(z.iso.date().brand('Jour'))

export type Jour = Model.TypeOf<typeof Jour>
