import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { sessionUserHasStructureEmployeuse } from '@app/web/auth/sessionUser'
import {
  getNextInscriptionStep,
  type InscriptionContexte,
  InscriptionFlowType,
  InscriptionStep,
  ProfilInscription,
} from '@app/web/features/inscription/domain'
import VerifierInformationsPage from '@app/web/features/inscription/ui/pages/VerifierInformationsPage'
import { stepPath } from '@app/web/features/inscription/ui/step-path'
import { allProfileInscriptionLabels } from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'
import { hasInscriptionComplete } from '@app/web/security/getHomepage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Vérifier vos informations'),
}

const VerifierInformationsPageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  // Écran de confirmation sans écriture : on dérive l'étape suivante du flow
  // (le « suivant » depuis verifier-informations est identique dans les deux
  // flows, d'où `withoutDataspace`), et on la passe en lien à un composant pur.
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

  // 14 employeuses de production n'ont aucune dénomination : le repli d'affichage
  // se décide ici, au point de composition, plutôt que dans la lecture.
  const employeuse = user.emplois.at(0)?.structure
  const structureEmployeuse = employeuse
    ? { ...employeuse, nom: employeuse.nom ?? '' }
    : undefined

  return (
    <VerifierInformationsPage
      profilLabel={
        user.profilInscription
          ? allProfileInscriptionLabels[user.profilInscription]
          : 'Non renseigné'
      }
      name={user.name}
      email={user.email}
      structureEmployeuse={structureEmployeuse}
      backHref={stepPath('choisir-role')}
      nextStepPath={nextStepPath}
    />
  )
}

export default VerifierInformationsPageRoute
