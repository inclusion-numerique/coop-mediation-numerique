import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { getVerifierInformationsPageData } from '@app/web/features/inscription/abilities/verifier-informations/queries/getVerifierInformationsPageData'
import VerifierInformationsPage from '@app/web/features/inscription/abilities/verifier-informations/ui/pages/VerifierInformationsPage'
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

  return (
    <VerifierInformationsPage data={getVerifierInformationsPageData(user)} />
  )
}

export default VerifierInformationsPageRoute
