import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { getLieuxActivite } from '@app/web/features/lieux-activite/getLieuxActivite'
import { contentId, defaultSkipLinks } from '@app/web/utils/skipLinks'
import Button from '@codegouvfr/react-dsfr/Button'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import React from 'react'
import { AucunLieu } from './_components/AucunLieu'
import { LieuActivite } from './_components/LieuActivite'
import VisibiliteMediateur from './_components/VisibiliteMediateur'

export const metadata: Metadata = {
  title: metadataTitle('Mes lieux d’activités'),
}

const LieuActiviteListPage = async () => {
  const user = await authenticateUser()

  if (!user.mediateur) {
    return redirect('/')
  }

  const lieuxActivites = await getLieuxActivite(user.mediateur.id)

  return (
    <>
      <SkipLinksPortal links={defaultSkipLinks} />
      <div className="fr-container fr-container--800 fr-mb-32v">
        <CoopBreadcrumbs currentPage="Mes lieux d'activités" />
        <main id={contentId} className="fr-mb-16w">
          <span className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-my-12v">
            <span
              className="ri-home-office-line ri-lg fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
              aria-hidden
            />
            <h1 className="fr-page-title fr-m-0">
              Mes lieux d’activités · {user.mediateur._count.enActivite}
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
          {user.mediateur.conseillerNumerique && (
            <VisibiliteMediateur isVisible={user.mediateur.isVisible} />
          )}
          <div className="fr-flex fr-direction-column fr-flex-gap-4v">
            {lieuxActivites.length === 0 ? (
              <AucunLieu />
            ) : (
              lieuxActivites.map((lieuActivite) => (
                <LieuActivite
                  key={lieuActivite.id}
                  {...lieuActivite.structure}
                  mediateurEnActiviteId={lieuActivite.id}
                  canDelete={lieuxActivites.length > 1}
                  creation={lieuActivite.creation}
                  modification={lieuActivite.modification}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export default LieuActiviteListPage
