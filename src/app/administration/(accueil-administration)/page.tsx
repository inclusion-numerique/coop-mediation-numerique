import { redirect } from 'next/navigation'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'

const Page = async () => {
  await authenticateAdmin()
  redirect('/administration/utilisateurs')
  return null
}

export default Page
