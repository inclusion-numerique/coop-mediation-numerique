import { notFound } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user.query'
import ConnexionReussiePage from '@/features/rdvsp/abilities/connecter-compte-rdv/ui/pages/ConnexionReussiePage'

export const metadata = {
  title: metadataTitle('Connexion à RDV Service Public réussie'),
}

const Page = async () => {
  const user = await getSessionUser()

  return user === null ? (
    notFound()
  ) : (
    <ConnexionReussiePage rdvAccount={user.rdvAccount} />
  )
}

export default Page
