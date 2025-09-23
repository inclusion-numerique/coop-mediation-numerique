import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import BackButton from '@app/web/components/BackButton'
import IconInSquare from '@app/web/components/IconInSquare'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import { redirect } from 'next/navigation'
import React from 'react'
import LieuxActiviteForm from './_components/LieuxActiviteForm'

const AjouterLieuPage = async () => {
  const user = await authenticateUser()

  if (!user.mediateur) {
    return redirect('/')
  }

  return (
    <>
      <SkipLinksPortal />
      <div id={contentId}>
        <div className="fr-container fr-container--narrow">
          <CoopBreadcrumbs
            parents={[
              {
                label: `Mes lieux d'activités`,
                linkProps: { href: '/coop/lieux-activite/' },
              },
            ]}
            currentPage={"Ajouter un lieu d'activité"}
          />
          <BackButton href="/coop/lieux-activite">
            Retour à mes lieux d&apos;activité
          </BackButton>

          <div className="fr-mb-32v fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey">
            <span className="fr-flex fr-direction-row fr-align-items-center fr-flex-gap-6v fr-mb-5w">
              <IconInSquare iconId="ri-home-office-line" />
              <h1 className="fr-h3 fr-page-title fr-m-0">
                Ajouter des lieux d’activités
              </h1>
            </span>
            <p className="fr-mb-6w">
              Recherchez dans les lieux déjà référencés. Si vous ne trouvez pas
              vos lieux d’activité, vous pouvez les créer afin d’être référencé.
            </p>
            <LieuxActiviteForm
              nextHref="/coop/lieux-activite"
              createStructureHref="/coop/lieux-activite/creer"
              userId={user.id}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default AjouterLieuPage
