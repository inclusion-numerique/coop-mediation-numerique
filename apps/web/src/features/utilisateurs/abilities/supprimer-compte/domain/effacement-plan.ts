import type { RattachementsDuCompte } from '@app/web/features/utilisateurs/domain'
import {
  coordinateurDe,
  mediateurDe,
} from '@app/web/features/utilisateurs/domain'
import { EffacementStep } from './effacement-report'

type PlannableStep = {
  readonly step: EffacementStep
  readonly due: (rattachements: RattachementsDuCompte) => boolean
}

const porteUnMediateur = (rattachements: RattachementsDuCompte): boolean =>
  mediateurDe(rattachements) !== null

const porteUnCoordinateur = (rattachements: RattachementsDuCompte): boolean =>
  coordinateurDe(rattachements) !== null

const porteUneEquipe = (rattachements: RattachementsDuCompte): boolean =>
  porteUnMediateur(rattachements) || porteUnCoordinateur(rattachements)

const always = (): boolean => true

const ORDERED_STEPS: readonly PlannableStep[] = [
  { step: EffacementStep('PortefeuilleBeneficiaires'), due: porteUnMediateur },
  { step: EffacementStep('EmpreinteRdv'), due: always },
  { step: EffacementStep('NotesAccompagnements'), due: porteUneEquipe },
  { step: EffacementStep('AppartenancesEquipe'), due: porteUneEquipe },
  { step: EffacementStep('LieuxActivite'), due: porteUnMediateur },
  { step: EffacementStep('PartageStatistiques'), due: porteUneEquipe },
  { step: EffacementStep('ListesDeDiffusion'), due: always },
]

export const effacementPlan = (
  rattachements: RattachementsDuCompte,
): readonly EffacementStep[] =>
  ORDERED_STEPS.filter(({ due }) => due(rattachements)).map(({ step }) => step)
