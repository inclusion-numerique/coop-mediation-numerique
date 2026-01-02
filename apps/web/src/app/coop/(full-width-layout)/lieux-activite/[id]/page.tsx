import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { LieuActivitePageContent } from '@app/web/features/lieux-activite/components/LieuActivitePageContent'
import { getLieuActivitePageData } from '@app/web/features/lieux-activite/getLieuActivitePageData'
import { contentId } from '@app/web/utils/skipLinks'
import { redirect } from 'next/navigation'
import React from 'react'

const LieuActiviteDetailPage = async (props: {
  params: Promise<{ id: string }>
}) => {
  const params = await props.params
  await authenticateUser(`/connexion?suivant=/lieux-activite/${params.id}`)

  const data = await getLieuActivitePageData({ id: params.id })

  if (!data) {
    redirect('/coop/lieux-activite')
  }

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container">
        <main id={contentId} className="fr-container fr-flex">
          <LieuActivitePageContent
            currentPath={`/coop/lieux-activite/${data.structure.id}`}
            data={data}
            breadcrumbs={{
              currentPage: data.structure.nom,
              parents: [
                {
                  label: "Mes lieux d'activités",
                  linkProps: { href: '/coop/lieux-activite/' },
                },
              ],
            }}
            backButton={{
              label: 'Retour à la liste',
              href: '/coop/lieux-activite',
            }}
          />
        </main>
      </div>
    </>
  )
}

export default LieuActiviteDetailPage
