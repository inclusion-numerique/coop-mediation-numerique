import { Metadata } from 'next'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { BienvenuePage } from '@/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/ui/pages/BienvenuePage'

export const metadata: Metadata = {
  title: metadataTitle('En savoir plus'),
}

const Page = async () => {
  const user = await authenticateUser()

  return (
    <BienvenuePage
      pageSuivante={
        user.coordinateur
          ? '/en-savoir-plus/coordinateur/mes-statistiques'
          : '/en-savoir-plus/mes-activites'
      }
    />
  )
}

export default Page
