import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const dispositifs = ['ConseillerNumerique', 'HorsDispositif'] as const

export const Dispositif = defineModel(z.enum(dispositifs).brand('Dispositif'))

export type Dispositif = Model.TypeOf<typeof Dispositif>

export const dispositifDe = (estConseillerNumerique: boolean): Dispositif =>
  Dispositif(estConseillerNumerique ? 'ConseillerNumerique' : 'HorsDispositif')

export const estEnPoste = (
  personne: { readonly conseillerNumeriqueEnPoste: object | null } | null,
): boolean => personne?.conseillerNumeriqueEnPoste != null
