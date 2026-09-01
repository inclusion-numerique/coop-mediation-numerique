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

/**
 * L'ORDRE de cette table est un invariant, pas une préférence d'écriture.
 *
 * Le portefeuille précède l'empreinte RDV parce que c'est son anonymisation qui
 * détache `rdvUserId` : sans elle, aucun usager n'est orphelin et le balayage
 * RDV ne supprimerait rien. Inverser les deux ne casse rien de visible — ça
 * n'efface simplement pas.
 *
 * Les listes de diffusion viennent en dernier : l'appel sort du réseau, et rien
 * n'oblige à l'attendre avant d'avoir effacé ce qui est chez nous.
 */
const ORDERED_STEPS: readonly PlannableStep[] = [
  { step: EffacementStep('PortefeuilleBeneficiaires'), due: porteUnMediateur },
  { step: EffacementStep('EmpreinteRdv'), due: always },
  { step: EffacementStep('NotesAccompagnements'), due: porteUneEquipe },
  { step: EffacementStep('AppartenancesEquipe'), due: porteUneEquipe },
  { step: EffacementStep('LieuxActivite'), due: porteUnMediateur },
  { step: EffacementStep('PartageStatistiques'), due: porteUneEquipe },
  { step: EffacementStep('ListesDeDiffusion'), due: always },
]

/**
 * Les étapes dues pour ce compte, dans l'ordre où elles doivent s'exécuter.
 *
 * Un compte sans rattachement ne déclenche que ce qui pend à l'utilisateur
 * lui-même — son compte RDV et ses listes de diffusion.
 */
export const effacementPlan = (
  rattachements: RattachementsDuCompte,
): readonly EffacementStep[] =>
  ORDERED_STEPS.filter(({ due }) => due(rattachements)).map(({ step }) => step)
