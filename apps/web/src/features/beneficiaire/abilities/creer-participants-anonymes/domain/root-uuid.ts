import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Graine UUID à partir de laquelle sont dérivés les identifiants des
 * bénéficiaires anonymes (cf. `createCounterUuid`).
 */
export const RootUuid = defineModel(z.string().uuid().brand('RootUuid'))

export type RootUuid = Model.TypeOf<typeof RootUuid>
