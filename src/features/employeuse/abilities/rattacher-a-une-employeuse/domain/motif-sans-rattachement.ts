import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const MotifSansRattachement = defineModel(
  z
    .enum(['SiretAbsent', 'ConseillerNumeriqueEnPoste'])
    .brand('MotifSansRattachement'),
)

export type MotifSansRattachement = Model.TypeOf<typeof MotifSansRattachement>
