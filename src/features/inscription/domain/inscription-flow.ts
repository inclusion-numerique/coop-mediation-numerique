import { InscriptionFlowType } from './inscription-flow-type'
import { InscriptionStep, type InscriptionStepValue } from './inscription-step'
import type { ProfilInscription } from './profil-inscription'

/**
 * Les quatre signaux qui pilotent la navigation. Toujours passés ensemble, donc
 * regroupés en composite d'entrée de la machine à états.
 */
export type InscriptionContexte = {
  readonly flowType: InscriptionFlowType
  readonly profil: ProfilInscription | null
  readonly hasLieuxActivite: boolean
  readonly isConseillerNumerique: boolean
}

/** Une transition : depuis un step, si la garde passe, vers un step (ou fin). */
type Transition = {
  readonly de: InscriptionStepValue
  readonly si?: (contexte: InscriptionContexte) => boolean
  readonly vers: InscriptionStepValue | null
}

const premiereTransition = (
  table: readonly Transition[],
  courant: InscriptionStep,
  contexte: InscriptionContexte,
): InscriptionStep | null => {
  const vers = table.find(
    (transition) =>
      transition.de === courant && (transition.si?.(contexte) ?? true),
  )?.vers
  return vers == null ? null : InscriptionStep(vers)
}

/** Parcours complet : flow sans Dataspace, ou pour un non-conseiller numérique. */
const fluxStandard: readonly Transition[] = [
  { de: 'initialize', vers: 'choisir-role' },
  {
    de: 'choisir-role',
    si: (c) => c.profil === 'Coordinateur',
    vers: 'recapitulatif',
  },
  { de: 'choisir-role', vers: 'verifier-informations' },
  {
    de: 'verifier-informations',
    si: (c) => c.profil === 'Mediateur' || c.profil === 'ConseillerNumerique',
    vers: 'lieux-activite',
  },
  { de: 'verifier-informations', vers: 'recapitulatif' },
  { de: 'lieux-activite', vers: 'recapitulatif' },
]

/** Parcours raccourci du flow Dataspace pour un conseiller numérique. */
const fluxDataspace: readonly Transition[] = [
  {
    de: 'initialize',
    si: (c) => c.profil === 'ConseillerNumerique' && c.hasLieuxActivite,
    vers: 'recapitulatif',
  },
  {
    de: 'initialize',
    si: (c) => c.profil === 'ConseillerNumerique',
    vers: 'verifier-informations',
  },
  {
    de: 'initialize',
    si: (c) => c.profil === 'CoordinateurConseillerNumerique',
    vers: 'recapitulatif',
  },
  { de: 'initialize', vers: 'choisir-role' },
  { de: 'lieux-activite', vers: 'recapitulatif' },
]

/** Détermine le type de flow selon la présence de données Dataspace. */
export const getInscriptionFlow = ({
  hasDataspaceData,
}: {
  readonly hasDataspaceData: boolean
}): InscriptionFlowType =>
  InscriptionFlowType(hasDataspaceData ? 'withDataspace' : 'withoutDataspace')

/**
 * Étape suivante du parcours, ou `null` si terminale. Le flow sans Dataspace (ou
 * pour un non-conseiller numérique) suit le parcours complet ; le flow Dataspace
 * raccourcit selon le profil et la présence de lieux déjà connus.
 */
export const getNextInscriptionStep = (
  courant: InscriptionStep,
  contexte: InscriptionContexte,
): InscriptionStep | null =>
  premiereTransition(
    contexte.flowType === 'withoutDataspace' || !contexte.isConseillerNumerique
      ? fluxStandard
      : fluxDataspace,
    courant,
    contexte,
  )
