import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { MauvaiseAdresseDeCourrielPage } from '@/features/equipe/abilities/consulter-une-invitation/ui/pages/MauvaiseAdresseDeCourrielPage'

const Page = async () => {
  const user = await authenticateUser()

  return <MauvaiseAdresseDeCourrielPage email={user.email} />
}

export default Page
