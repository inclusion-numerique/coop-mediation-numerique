import { redirect } from 'next/navigation'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'

const Page = async () => {
  await authenticateAdmin()
  redirect('/administration/utilisateurs')
  return null
}

export default Page
