import { redirect } from 'next/navigation'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateUser } from '@/auth/authenticateUser'
import SkipLinksPortal from '@/components/SkipLinksPortal'
import CreerLieuActivitePage from '@/features/inscription/abilities/renseigner-lieux-activite/ui/pages/CreerLieuActivitePage'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { ClientBinder } from '@/libs/injection/client-binder'
import { contentId } from '@/utils/skipLinks'

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
