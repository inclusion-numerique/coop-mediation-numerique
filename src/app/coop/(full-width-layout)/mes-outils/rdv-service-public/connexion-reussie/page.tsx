import { notFound } from 'next/navigation'
import { estMain, metadataTitle } from '@/configuration/projet'
import { getSessionUser } from '@/features/authentification/middlewares/with-utilisateur-de-la-session'
import ConnexionReussiePage from '@/features/rdvsp/abilities/connecter-compte-rdv/ui/pages/ConnexionReussiePage'
import { lienDuSiteRdv } from '@/features/rdvsp/ui/presenters/liens.presenter'

export const metadata = {
  title: metadataTitle('Connexion à RDV Service Public réussie'),
}

const Page = async () => {
  const user = await getSessionUser()

  return user === null ? (
    notFound()
  ) : (
    <ConnexionReussiePage
      rdvAccount={user.rdvAccount}
      lienDuSiteRdv={lienDuSiteRdv(estMain())}
    />
  )
}

export default Page
