import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { getLieuxActiviteListPageData } from '@app/web/features/lieux-activite/getLieuxActiviteListPageData'
import RemoveMediateurFromLieuModal from '@app/web/features/mon-reseau/use-cases/acteurs/components/RemoveMediateurFromLieuModal/RemoveMediateurFromLieuModal'
import LieuCard from '@app/web/features/mon-reseau/use-cases/lieux/components/LieuCard'
import { contentId } from '@app/web/utils/skipLinks'
import Button from '@codegouvfr/react-dsfr/Button'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import React from 'react'
import { AucunLieu } from './_components/AucunLieu'
import VisibiliteMediateur from './_components/VisibiliteMediateur'

export const metadata: Metadata = {
  title: metadataTitle('Mes lieux d’activités'),
}

const LieuActiviteListPage = async () => {
  const user = await authenticateUser()
  const mediateur = user.mediateur
  const mediateurId = user.mediateur?.id

  if (!mediateur || !mediateurId) {
    return redirect('/')
  }

  const lieuxActivites = await getLieuxActiviteListPageData({
    mediateurId,
  })

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--medium fr-mb-32v">
        <CoopBreadcrumbs currentPage="Mes lieux d'activités" />
        <main id={contentId} className="fr-mb-16w">
          <span className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-my-12v">
            <span
              className="ri-home-office-line ri-lg fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
              aria-hidden
            />
            <h1 className="fr-page-title fr-m-0">
              Mes lieux d’activités · {mediateur._count.enActivite}
            </h1>
            <Button
              className="fr-ml-auto"
              priority="secondary"
              linkProps={{
                href: '/coop/lieux-activite/ajouter',
              }}
              iconId="fr-icon-add-line"
            >
              Ajouter un lieu
            </Button>
          </span>
          {mediateur.conseillerNumerique && (
            <VisibiliteMediateur
              isVisible={user.mediateur?.isVisible ?? false}
            />
          )}
          <div className="fr-flex fr-direction-column fr-flex-gap-4v">
            {lieuxActivites.length === 0 ? (
              <AucunLieu />
            ) : (
              <>
                {lieuxActivites.map(({ id, structure: lieu }) => (
                  <LieuCard
                    key={id}
                    lieu={lieu}
                    removeMediateurFromLieu={{
                      mediateurId,
                    }}
                  />
                ))}
                <RemoveMediateurFromLieuModal />
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export default LieuActiviteListPage
