import { redirect } from 'next/navigation'
import { creerLieuActiviteAction } from '@/app/_actions/inscription/creer-lieu-activite.action'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import { CREER_LIEU_ACTIVITE_ACTION_KEY } from '@/features/inscription/abilities/renseigner-lieux-activite/action/creer-lieu-activite.key'
import CreerLieuActivitePage from '@/features/inscription/abilities/renseigner-lieux-activite/ui/pages/CreerLieuActivitePage'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { LIEN_DE_PRISE_DE_RENDEZ_VOUS_KEY } from '@/features/lieux-activite/ui'
import { rdvWebsiteLink } from '@/features/rdvsp/urls'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Finaliser mon inscription'),
}

const Page = async (props: {
  searchParams: Promise<{
    nom?: string
    retour?: string
  }>
}) => {
  const { nom, retour } = await props.searchParams

  const user = await authenticateUser()

  if (!user.mediateur || !retour) {
    redirect('/inscription')
  }

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <ClientBinder bind={LIEN_DE_PRISE_DE_RENDEZ_VOUS_KEY} to={rdvWebsiteLink}>
        <SkipLinksPortal />
        <main id={contentId} className="fr-width-full">
          <ClientBinder
            bind={CREER_LIEU_ACTIVITE_ACTION_KEY}
            to={creerLieuActiviteAction}
          >
            <CreerLieuActivitePage nom={nom} retourHref={retour} />
          </ClientBinder>
        </main>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
