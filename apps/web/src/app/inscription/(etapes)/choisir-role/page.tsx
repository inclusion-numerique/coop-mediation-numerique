import { choisirProfilAction } from '@app/web/app/_actions/inscription/choisir-profil.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import ChoisirRolePage from '@app/web/features/inscription/abilities/choisir-profil/ui/pages/ChoisirRolePage'
import { hasInscriptionComplete } from '@app/web/security/getHomepage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Choisir votre rôle'),
}

const ChoisirRolePageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  return <ChoisirRolePage save={choisirProfilAction} />
}

export default ChoisirRolePageRoute
