import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import ChoisirRolePage from '@app/web/features/inscription/use-cases/choisir-role/ChoisirRolePage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Choisir votre rôle'),
}

const ChoisirRolePageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already validated, redirect to coop
  if (user.inscriptionValidee) {
    redirect('/coop')
  }

  return <ChoisirRolePage userId={user.id} />
}

export default ChoisirRolePageRoute
