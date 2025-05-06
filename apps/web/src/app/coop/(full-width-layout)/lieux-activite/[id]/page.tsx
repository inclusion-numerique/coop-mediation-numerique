import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { LieuActivitePageContent } from '@app/web/features/lieux-activite/components/LieuActivitePageContent'
import { getLieuActiviteById } from '@app/web/features/lieux-activite/getLieuActiviteById'
import { contentId, defaultSkipLinks } from '@app/web/utils/skipLinks'
import { redirect } from 'next/navigation'
import React from 'react'

const LieuActiviteDetailPage = async ({
  params,
}: {
  params: { id: string }
}) => {
  await authenticateUser(`/connexion?suivant=/lieux-activite/${params.id}`)

  const lieuActivite = await getLieuActiviteById(params.id)

  return lieuActivite?.structure == null ? (
    redirect('/coop/lieux-activite')
  ) : (
    <>
      <SkipLinksPortal links={defaultSkipLinks} />
      <div className="fr-container ">
        <main id={contentId} className="fr-container fr-flex">
          <LieuActivitePageContent
            structure={lieuActivite.structure}
            contentTop={
              <>
                <CoopBreadcrumbs
                  parents={[
                    {
                      label: "Mes lieux d'activités",
                      linkProps: { href: '/coop/lieux-activite/' },
                    },
                  ]}
                  currentPage={lieuActivite.structure.nom}
                />
                <BackButton href="/coop/lieux-activite">
                  Retour à mes lieux d&apos;activité
                </BackButton>
              </>
            }
          />
        </main>
      </div>
    </>
  )
}

export default LieuActiviteDetailPage
