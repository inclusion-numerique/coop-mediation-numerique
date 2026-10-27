import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const slugsDOutil = [
  'abc-diag',
  'aidants-connect',
  'cartographie-nationale-des-lieux-d-inclusion-numerique',
  'les-bases-du-numerique-d-interet-general',
  'mon-inclusion-numerique',
  'pix',
  'rdv-service-public',
] as const

export type ValeurDeSlugOutil = (typeof slugsDOutil)[number]

export const SlugOutil = defineModel(
  z.string().pipe(z.enum(slugsDOutil)).brand('SlugOutil'),
)

export type SlugOutil = Model.TypeOf<typeof SlugOutil>
