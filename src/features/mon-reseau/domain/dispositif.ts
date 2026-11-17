import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const dispositifs = ['ConseillerNumerique', 'HorsDispositif'] as const

export const Dispositif = defineModel(z.enum(dispositifs).brand('Dispositif'))

export type Dispositif = Model.TypeOf<typeof Dispositif>

export const dispositifDe = (estConseillerNumerique: boolean): Dispositif =>
  Dispositif(estConseillerNumerique ? 'ConseillerNumerique' : 'HorsDispositif')
