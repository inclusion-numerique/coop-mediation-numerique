import {
  getNextInscriptionStep,
  type InscriptionContexte,
  InscriptionFlowType,
  InscriptionStep,
  ProfilInscription,
  profilInscriptionLabels,
} from '@/features/inscription/domain'
import type { ProfilInscriptionValue } from '@/features/inscription/domain/profil-inscription'
import { stepPath } from '@/features/inscription/ui/step-path'

// Une employeuse peut n'avoir aucune dénomination en base, mais la carte attend
// un libellé : la projection porte le contrat d'affichage et décide du repli,
// plutôt que de laisser l'absence voyager jusqu'au composant.
type StructureDeLEmploi = {
  readonly nom: string | null
  readonly codeInsee: string | null
}

type StructureEmployeuseAffichee = Omit<StructureDeLEmploi, 'nom'> & {
  readonly nom: string
}

type InscritAVerifier = {
  readonly profilInscription: ProfilInscriptionValue | null
  readonly isConseillerNumerique: boolean
  readonly name: string | null
  readonly email: string
  readonly emplois: readonly { readonly structure: StructureDeLEmploi }[]
}

export type VerifierInformationsPageData = {
  readonly profilLabel: string
  readonly name: string | null
  readonly email: string
  readonly structureEmployeuse?: StructureEmployeuseAffichee
  readonly backHref: string
  readonly nextStepPath: string
}

/**
 * Projette l'utilisateur de la session vers les données de la page de vérification. Pure :
 * dérive l'étape suivante via le domaine (le « suivant » depuis verifier-informations
 * est identique dans les deux flows, d'où `withoutDataspace`) et applique le cas
 * spécial lieux-activité → structure-employeuse/renseigner. Toute la logique de
 * cet écran read/nav vit ici, laissant la route-hub minimale.
 */
export const getVerifierInformationsPageData = (
  user: InscritAVerifier,
): VerifierInformationsPageData => {
  const contexte: InscriptionContexte = {
    flowType: InscriptionFlowType('withoutDataspace'),
    profil: user.profilInscription
      ? ProfilInscription(user.profilInscription)
      : null,
    hasLieuxActivite: false,
    isConseillerNumerique: user.isConseillerNumerique,
  }

  const nextStep = getNextInscriptionStep(
    InscriptionStep('verifier-informations'),
    contexte,
  )

  if (!nextStep) {
    throw new Error('No next step found for inscription')
  }

  const nextStepPath =
    nextStep === 'lieux-activite'
      ? user.emplois.length > 0
        ? `${stepPath('lieux-activite')}/structure-employeuse`
        : stepPath('renseigner-structure-employeuse')
      : stepPath(nextStep)

  const employeuse = user.emplois.at(0)?.structure

  return {
    profilLabel: user.profilInscription
      ? profilInscriptionLabels[user.profilInscription]
      : 'Non renseigné',
    name: user.name,
    email: user.email,
    structureEmployeuse: employeuse
      ? { ...employeuse, nom: employeuse.nom ?? '' }
      : undefined,
    backHref: stepPath('choisir-role'),
    nextStepPath,
  }
}
