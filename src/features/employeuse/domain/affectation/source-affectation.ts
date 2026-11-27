import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

const sourcesAffectation = ['idposte', 'coop', 'autre'] as const

type SourceConnue = (typeof sourcesAffectation)[number]

const sourcesConnues: Record<string, SourceConnue> = {
  idposte: 'idposte',
  coop: 'coop',
}

export const SourceAffectation = defineModel(
  z
    .string()
    .nullish()
    .transform(
      (value): SourceConnue =>
        sourcesConnues[(value ?? '').trim().toLowerCase()] ?? 'autre',
    ),
)

export type SourceAffectation = Model.TypeOf<typeof SourceAffectation>
