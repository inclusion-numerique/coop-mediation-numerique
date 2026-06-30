import { InscriptionFlowType } from './inscription-flow-type'
import { InscriptionStep } from './inscription-step'
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

const steps = {
  choisirRole: InscriptionStep('choisir-role'),
  verifierInformations: InscriptionStep('verifier-informations'),
  lieuxActivite: InscriptionStep('lieux-activite'),
  recapitulatif: InscriptionStep('recapitulatif'),
} as const

/** Détermine le type de flow selon la présence de données Dataspace. */
export const getInscriptionFlow = ({
  hasDataspaceData,
}: {
  readonly hasDataspaceData: boolean
}): InscriptionFlowType =>
  InscriptionFlowType(hasDataspaceData ? 'withDataspace' : 'withoutDataspace')

const nextWithoutDataspace = (
  currentStep: InscriptionStep,
  profil: ProfilInscription | null,
): InscriptionStep | null => {
  if (currentStep === 'initialize') return steps.choisirRole
  if (currentStep === 'choisir-role')
    return profil === 'Coordinateur'
      ? steps.recapitulatif
      : steps.verifierInformations
  if (currentStep === 'verifier-informations')
    return profil === 'Mediateur' || profil === 'ConseillerNumerique'
      ? steps.lieuxActivite
      : steps.recapitulatif
  if (currentStep === 'lieux-activite') return steps.recapitulatif
  return null
}

const nextWithDataspace = (
  currentStep: InscriptionStep,
  profil: ProfilInscription | null,
  hasLieuxActivite: boolean,
): InscriptionStep | null => {
  if (currentStep === 'initialize') {
    if (profil === 'ConseillerNumerique')
      return hasLieuxActivite ? steps.recapitulatif : steps.verifierInformations
    if (profil === 'CoordinateurConseillerNumerique') return steps.recapitulatif
    return steps.choisirRole
  }
  if (currentStep === 'lieux-activite') return steps.recapitulatif
  return null
}

/**
 * Étape suivante du parcours, ou `null` si terminale. Le flow sans Dataspace (ou
 * pour un non-conseiller numérique) suit le parcours complet ; le flow Dataspace
 * raccourcit selon le profil et la présence de lieux déjà connus.
 */
export const getNextInscriptionStep = (
  currentStep: InscriptionStep,
  {
    flowType,
    profil,
    hasLieuxActivite,
    isConseillerNumerique,
  }: InscriptionContexte,
): InscriptionStep | null =>
  flowType === 'withoutDataspace' || !isConseillerNumerique
    ? nextWithoutDataspace(currentStep, profil)
    : nextWithDataspace(currentStep, profil, hasLieuxActivite)
