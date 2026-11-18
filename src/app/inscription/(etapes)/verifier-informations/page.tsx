import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { hasInscriptionComplete } from '@/features/authentification/domain/getHomepage'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import { getVerifierInformationsPageData } from '@/features/inscription/abilities/verifier-informations/queries/getVerifierInformationsPageData'
import VerifierInformationsPage from '@/features/inscription/abilities/verifier-informations/ui/pages/VerifierInformationsPage'

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

  return (
    <VerifierInformationsPage data={getVerifierInformationsPageData(user)} />
  )
}

export default VerifierInformationsPageRoute
