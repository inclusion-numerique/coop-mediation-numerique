import CreerStructurePageContent from '@app/web/app/inscription/creer-un-lieu-d-activite/CreerStructurePageContent'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import { redirect } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Finaliser mon inscription'),
}

// next js query params "profil": ProfilInscription
const Page = async (props: {
  searchParams: Promise<{
    nom?: string
    retour?: string
  }>
}) => {
  const searchParams = await props.searchParams

  const { nom, retour } = searchParams

  const user = await authenticateUser()

  if (!user.mediateur || !retour) {
    redirect('/inscription')
  }

  return (
    <>
      <SkipLinksPortal />
      <main id={contentId} className="fr-width-full">
        <CreerStructurePageContent
          backLinkHref={retour}
          nextHref={retour}
          backLinkTitle="Retour aux lieux d’activité"
          lieuActiviteMediateurId={user.mediateur.id}
          title="Lieu d’activité"
          defaultValues={{ nom }}
        />
      </main>
    </>
  )
}

export default Page
