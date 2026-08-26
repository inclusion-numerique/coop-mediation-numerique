import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import CreerLieuActivitePage from '@app/web/features/inscription/abilities/renseigner-lieux-activite/ui/pages/CreerLieuActivitePage'
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
    <>
      <SkipLinksPortal />
      <main id={contentId} className="fr-width-full">
        <CreerLieuActivitePage nom={nom} retourHref={retour} />
      </main>
    </>
  )
}

export default Page
