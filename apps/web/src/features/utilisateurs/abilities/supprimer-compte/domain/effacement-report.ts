import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const effacementSteps = [
  'PortefeuilleBeneficiaires',
  'NotesAccompagnements',
  'EmpreinteRdv',
  'AppartenancesEquipe',
  'LieuxActivite',
  'PartageStatistiques',
  'ListesDeDiffusion',
] as const

/** Une étape d'effacement, nommée par son intention et non par sa table. */
export const EffacementStep = defineModel(
  z.enum(effacementSteps).brand('EffacementStep'),
)
export type EffacementStep = Model.TypeOf<typeof EffacementStep>

/**
 * Ce qu'une étape a effacé.
 *
 * Une magnitude, pas un décompte de lignes : une étape additionne des
 * rendez-vous et des usagers, une autre ramène un retrait de liste à 1. Le
 * nombre n'est comparable qu'à lui-même d'une exécution à l'autre.
 *
 * Minoré par 1, parce que zéro porte déjà un nom : `skipped`. C'est le seul
 * endroit du parcours où un nombre rendu par un adaptateur devient un fait de
 * constat — les ports, eux, rendent des `number` nus.
 */
export const ErasedCount = defineModel(
  z.number().int().min(1).brand('ErasedCount'),
)
export type ErasedCount = Model.TypeOf<typeof ErasedCount>

export const FailureReason = defineModel(
  z.string().trim().min(1).max(500).brand('FailureReason'),
)
export type FailureReason = Model.TypeOf<typeof FailureReason>

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

/**
 * L'effacement a-t-il abouti (DM-4) ?
 *
 * Axe DISTINCT du `Result` de l'ability : l'accès peut être coupé — donc la
 * suppression réussie du point de vue de la personne — alors qu'une étape
 * satellite a échoué et que la promesse d'effacement n'est pas encore tenue.
 * Les confondre ferait avaler l'un des deux ; les séparer permet de journaliser
 * le partiel et de le reprendre.
 */
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

export const isComplete = (effacementReport: EffacementReport): boolean =>
  effacementReport._tag === 'complete'
