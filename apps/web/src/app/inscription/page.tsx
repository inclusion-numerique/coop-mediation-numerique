import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { redirect } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Inscription'),
}

const InscriptionPage = async () => {
  const user = await authenticateUser()

  // If inscription is already validated, redirect to coop
  if (user.inscriptionValidee) {
    redirect('/coop')
    return null
  }

  // If user has not started inscription, redirect to initializer
  if (!user.profilInscription) {
    redirect('/inscription/initialiser')
    return null
  }

  // If user has chosen role but not completed, redirect to appropriate step
  if (user.profilInscription && !user.inscriptionValidee) {
    // If mediateur and no lieux activite, go to lieux activite
    if (
      (user.profilInscription === 'Mediateur' ||
        user.profilInscription === 'ConseillerNumerique') &&
      !user.lieuxActiviteRenseignes
    ) {
      redirect('/inscription/lieux-activite')
      return null
    }
    // Otherwise go to recap
    redirect('/inscription/recapitulatif')
    return null
  }

  // Fallback to initializer
  redirect('/inscription/initialiser')
  return null
}

export default InscriptionPage


