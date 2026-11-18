import { redirect } from 'next/navigation'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import { AjouterDesLieuxPage } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/pages/AjouterDesLieuxPage'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import BackButton from '@/libraries/ui/components/BackButton'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'

const AjouterLieuPage = async () => {
  const user = await authenticateUser()

  if (!user.mediateur) {
    return redirect('/')
  }

  return (
    <>
      <SkipLinksPortal />
      <div id={contentId}>
        <AjouterDesLieuxPage
          retourHref="/coop/lieux-activite"
          entete={
            <>
              <CoopBreadcrumbs
                parents={[
                  {
                    label: `Mes lieux d'activités`,
                    linkProps: { href: '/coop/lieux-activite/' },
                  },
                ]}
                currentPage={"Ajouter un lieu d'activité"}
              />
              <BackButton />
            </>
          }
        />
      </div>
    </>
  )
}

export default AjouterLieuPage
