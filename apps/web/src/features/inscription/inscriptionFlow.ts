import type { ProfilInscription } from '@prisma/client'

export type InscriptionFlowType = 'withDataspace' | 'withoutDataspace'

export type InscriptionStep =
  | 'initialize'
  | 'choisir-role'
  | 'verifier-informations'
  | 'lieux-activite'
  | 'recapitulatif'

export type InscriptionFlowConfig = {
  type: InscriptionFlowType
  steps: InscriptionStep[]
  currentStep: InscriptionStep
  nextStep: InscriptionStep | null
  previousStep: InscriptionStep | null
}

/**
 * Get the inscription flow configuration based on user state
 */
export const getInscriptionFlow = ({
  hasDataspaceData,
  profilInscription,
  lieuxActiviteRenseignes,
  hasLieuxActivite,
}: {
  hasDataspaceData: boolean
  profilInscription: ProfilInscription | null
  lieuxActiviteRenseignes: Date | null
  hasLieuxActivite: boolean
}): InscriptionFlowType => {
  if (hasDataspaceData) {
    return 'withDataspace'
  }
  return 'withoutDataspace'
}

/**
 * Get the next step in the inscription flow
 */
export const getNextInscriptionStep = ({
  currentStep,
  flowType,
  profilInscription,
  hasLieuxActivite,
}: {
  currentStep: InscriptionStep
  flowType: InscriptionFlowType
  profilInscription: ProfilInscription | null
  hasLieuxActivite: boolean
}): InscriptionStep | null => {
  if (flowType === 'withoutDataspace') {
    switch (currentStep) {
      case 'initialize':
        return 'choisir-role'
      case 'choisir-role':
        return 'verifier-informations'
      case 'verifier-informations':
        // If mediateur, go to lieux activite
        if (
          profilInscription === 'Mediateur' ||
          profilInscription === 'ConseillerNumerique'
        ) {
          return 'lieux-activite'
        }
        // If coordinateur, go directly to recap
        return 'recapitulatif'
      case 'lieux-activite':
        return 'recapitulatif'
      case 'recapitulatif':
        return null
      default:
        return null
    }
  }

  // Flow with Dataspace
  switch (currentStep) {
    case 'initialize':
      // If mediateur without lieux, go to lieux activite
      if (
        (profilInscription === 'Mediateur' ||
          profilInscription === 'ConseillerNumerique') &&
        !hasLieuxActivite
      ) {
        return 'lieux-activite'
      }
      // Otherwise go directly to recap
      return 'recapitulatif'
    case 'lieux-activite':
      return 'recapitulatif'
    case 'recapitulatif':
      return null
    default:
      return null
  }
}

/**
 * Get the URL path for a step
 */
export const getStepPath = (step: InscriptionStep): string => {
  switch (step) {
    case 'initialize':
      return '/inscription/initialiser'
    case 'choisir-role':
      return '/inscription/choisir-role'
    case 'verifier-informations':
      return '/inscription/verifier-informations'
    case 'lieux-activite':
      return '/inscription/lieux-activite'
    case 'recapitulatif':
      return '/inscription/recapitulatif'
    default:
      return '/inscription'
  }
}

