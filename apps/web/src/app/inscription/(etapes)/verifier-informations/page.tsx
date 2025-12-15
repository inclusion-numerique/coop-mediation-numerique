import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import VerifierInformationsPage from '@app/web/features/inscription/use-cases/verifier-informations/VerifierInformationsPage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Vérifier vos informations'),
}

const VerifierInformationsPageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already validated, redirect to coop
  if (user.inscriptionValidee) {
    redirect('/coop')
  }

  // If role not chosen, redirect back
  if (!user.profilInscription || !user.acceptationCgu) {
    redirect('/inscription/choisir-role')
  }

  return <VerifierInformationsPage user={user} />
}

export default VerifierInformationsPageRoute
