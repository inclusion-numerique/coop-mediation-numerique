import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { getLieuxActiviteListPageData } from '@app/web/features/lieux-activite/getLieuxActiviteListPageData'
import RemoveMediateurFromLieuModal from '@app/web/features/mon-reseau/use-cases/acteurs/components/RemoveMediateurFromLieuModal/RemoveMediateurFromLieuModal'
import LieuCard from '@app/web/features/mon-reseau/use-cases/lieux/components/LieuCard'
import SortSelect from '@app/web/libs/data-table/SortSelect'
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

const LieuActiviteListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ tri?: string }>
}) => {
  const { tri } = await searchParams
  const user = await authenticateUser()
  const mediateur = user.mediateur
  const mediateurId = user.mediateur?.id

  if (!mediateur || !mediateurId) {
    return redirect('/')
  }

  const lieuxActivites = await getLieuxActiviteListPageData({
    mediateurId,
    tri,
  })

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--medium fr-mb-32v">
        <CoopBreadcrumbs currentPage="Mes lieux d'activités" />
        <main id={contentId} className="fr-mb-32v">
          <span className="fr-flex fr-flex-wrap fr-direction-md-row fr-direction-column fr-align-items-md-center fr-flex-gap-4v fr-my-10v">
            <span className="fr-flex fr-direction-row fr-align-items-end fr-flex-gap-4v ">
              <span
                className="ri-home-office-line ri-xl fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
                aria-hidden
              />
              <h1 className="fr-page-title fr-m-0">Mes lieux d’activités</h1>
            </span>
            <Button
              className="fr-ml-md-auto"
              priority="secondary"
              linkProps={{
                href: '/coop/lieux-activite/ajouter',
              }}
              iconId="fr-icon-add-line"
            >
              Ajouter un lieu
            </Button>
          </span>
          <VisibiliteMediateur isVisible={mediateur.isVisible} />
          <div className="fr-flex fr-direction-column fr-pt-4v">
            {lieuxActivites.length === 0 ? (
              <AucunLieu />
            ) : (
              <>
                <div className="fr-mb-6v fr-flex fr-align-items-center fr-justify-content-space-between fr-flex-gap-2v">
                  <span className="fr-text--bold fr-text--uppercase fr-text--xs fr-mb-0">
                    {mediateur._count.enActivite}{' '}
                    {mediateur._count.enActivite === 1 ? 'lieu' : 'lieux'}
                  </span>
                  <span className="fr-mr-4v">
                    <SortSelect
                      baseHref="/coop/lieux-activite"
                      options={[
                        { label: 'Nom (A à Z)', value: 'nomaz' },
                        { label: 'Nom (Z à A)', value: 'nomza' },
                        { label: 'MAJ récente', value: 'majrecent' },
                        { label: 'MAJ ancienne', value: 'majancien' },
                      ]}
                    />
                  </span>
                </div>
                <hr className="fr-separator-1px" />
                {lieuxActivites.map(({ id, lieuInclusion: lieu }) => (
                  <LieuCard
                    key={id}
                    lieu={lieu}
                    removeMediateurFromLieu={{
                      mediateurId,
                    }}
                    showActionButtons
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
