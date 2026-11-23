import { redirect } from 'next/navigation'
import { authenticateAdmin } from '@/features/authentification/implementation/session/authenticateUser'

const Page = async () => {
  await authenticateAdmin()
  redirect('/administration/utilisateurs')
  return null
}

export default Page
