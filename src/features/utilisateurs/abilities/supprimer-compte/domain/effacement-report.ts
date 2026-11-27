import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { EchecTechnique } from '@/libraries/result'

export const effacementSteps = [
  'PortefeuilleBeneficiaires',
  'NotesAccompagnements',
  'EmpreinteRdv',
  'AppartenancesEquipe',
  'LieuxActivite',
  'PartageStatistiques',
  'ListesDeDiffusion',
] as const

export type NomEffacementStep = (typeof effacementSteps)[number]

export const EffacementStep = defineModel(
  z.enum(effacementSteps).brand('EffacementStep'),
)
export type EffacementStep = Model.TypeOf<typeof EffacementStep>

export const ErasedCount = defineModel(
  z.number().int().min(1).brand('ErasedCount'),
)
export type ErasedCount = Model.TypeOf<typeof ErasedCount>

export const FailureReason = defineModel(
  z.string().trim().min(1).max(500).brand('FailureReason'),
)
export type FailureReason = Model.TypeOf<typeof FailureReason>

const SANS_MESSAGE = FailureReason('Erreur sans message')

export const failureReasonOf = ({ cause }: EchecTechnique): FailureReason =>
  FailureReason.safe(cause.slice(0, 500)) ?? SANS_MESSAGE

export type StepResult =
  | {
      readonly _tag: 'erased'
      readonly step: EffacementStep
      readonly count: ErasedCount
    }
  | { readonly _tag: 'skipped'; readonly step: EffacementStep }
  | {
      readonly _tag: 'failed'
      readonly step: EffacementStep
      readonly cause: FailureReason
    }

export type EffacementReport =
  | { readonly _tag: 'complete'; readonly results: readonly StepResult[] }
  | {
      readonly _tag: 'partial'
      readonly results: readonly StepResult[]
      readonly failed: readonly EffacementStep[]
    }

export const report = (results: readonly StepResult[]): EffacementReport => {
  const failed = results
    .filter((result) => result._tag === 'failed')
    .map((result) => result.step)

  return failed.length === 0
    ? { _tag: 'complete', results }
    : { _tag: 'partial', results, failed }
}
