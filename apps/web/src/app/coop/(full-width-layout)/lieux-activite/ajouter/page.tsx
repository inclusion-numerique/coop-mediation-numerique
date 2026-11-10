import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { AjouterDesLieuxPage } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/pages/AjouterDesLieuxPage'
import { contentId } from '@app/web/utils/skipLinks'
import { redirect } from 'next/navigation'

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
