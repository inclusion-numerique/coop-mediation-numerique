import { redirect } from 'next/navigation'
import CoopBreadcrumbs from '@/app/coop/CoopBreadcrumbs'
import { authenticateUser } from '@/auth/authenticateUser'
import BackButton from '@/components/BackButton'
import SkipLinksPortal from '@/components/SkipLinksPortal'
import { AjouterDesLieuxPage } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/pages/AjouterDesLieuxPage'
import { contentId } from '@/utils/skipLinks'

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
