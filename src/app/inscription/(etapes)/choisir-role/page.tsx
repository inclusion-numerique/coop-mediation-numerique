import { redirect } from 'next/navigation'
import { choisirProfilAction } from '@/app/_actions/inscription/choisir-profil.action'
import { metadataTitle } from '@/configuration/projet'
import { aTermineSonInscription } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import ChoisirRolePage from '@/features/inscription/abilities/choisir-profil/ui/pages/ChoisirRolePage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Choisir votre rôle'),
}

const ChoisirRolePageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (aTermineSonInscription(user)) {
    redirect('/coop')
  }

  return <ChoisirRolePage save={choisirProfilAction} />
}

export default ChoisirRolePageRoute
