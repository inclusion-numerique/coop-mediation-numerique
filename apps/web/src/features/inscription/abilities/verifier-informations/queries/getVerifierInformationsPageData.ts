import type { SessionUser } from '@app/web/auth/sessionUser'
import { sessionUserHasStructureEmployeuse } from '@app/web/auth/sessionUser'
import {
  getNextInscriptionStep,
  type InscriptionContexte,
  InscriptionFlowType,
  InscriptionStep,
  ProfilInscription,
} from '@app/web/features/inscription/domain'
import { stepPath } from '@app/web/features/inscription/ui/step-path'
import { allProfileInscriptionLabels } from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'

// Une employeuse peut n'avoir aucune dénomination en base, mais la carte attend
// un libellé : la projection porte le contrat d'affichage et décide du repli,
// plutôt que de laisser l'absence voyager jusqu'au composant.
type StructureEmployeuseAffichee = Omit<
  SessionUser['emplois'][number]['structure'],
  'nom'
> & { readonly nom: string }

export type VerifierInformationsPageData = {
  readonly profilLabel: string
  readonly name: string | null
  readonly email: string
  readonly structureEmployeuse?: StructureEmployeuseAffichee
  readonly backHref: string
  readonly nextStepPath: string
}

/**
 * Projette le `SessionUser` vers les données de la page de vérification. Pure :
 * dérive l'étape suivante via le domaine (le « suivant » depuis verifier-informations
 * est identique dans les deux flows, d'où `withoutDataspace`) et applique le cas
 * spécial lieux-activité → structure-employeuse/renseigner. Toute la logique de
 * cet écran read/nav vit ici, laissant la route-hub minimale.
 */
export const getVerifierInformationsPageData = (
  user: SessionUser,
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
      ? sessionUserHasStructureEmployeuse(user)
        ? `${stepPath('lieux-activite')}/structure-employeuse`
        : stepPath('renseigner-structure-employeuse')
      : stepPath(nextStep)

  const employeuse = user.emplois.at(0)?.structure

  return {
    profilLabel: user.profilInscription
      ? allProfileInscriptionLabels[user.profilInscription]
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
