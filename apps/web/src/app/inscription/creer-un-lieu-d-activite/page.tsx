import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import CreerLieuActivitePage from '@app/web/features/inscription/abilities/renseigner-lieux-activite/ui/pages/CreerLieuActivitePage'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { contentId } from '@app/web/utils/skipLinks'
import { redirect } from 'next/navigation'

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
      <>
        <SkipLinksPortal />
        <main id={contentId} className="fr-width-full">
          <CreerLieuActivitePage nom={nom} retourHref={retour} />
        </main>
      </>
    </ClientBinder>
  )
}

export default Page
