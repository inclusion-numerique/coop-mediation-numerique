import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { LieuActivitePageContent } from '@app/web/features/lieux-activite/components/LieuActivitePageContent'
import { getLieuActivitePageData } from '@app/web/features/lieux-activite/getLieuActivitePageData'
import { contentId } from '@app/web/utils/skipLinks'
import { redirect } from 'next/navigation'
import React from 'react'

const LieuActiviteDetailPage = async (props: {
  params: Promise<{ id: string; retour?: string }>
}) => {
  const params = await props.params
  await authenticateUser(`/connexion?suivant=/lieux-activite/${params.id}`)
  const { retour } = params

  const data = await getLieuActivitePageData({ id: params.id })

  const retourHref = retour ?? '/coop/mon-reseau/lieux'
  const retourLabel = 'Retour'

  if (!data) {
    redirect('/coop/lieux-activite')
  }

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container">
        <main id={contentId} className="fr-container fr-flex">
          <LieuActivitePageContent
            data={data}
            breadcrumbs={{
              currentPage: data.structure.nom,
              parents: [
                {
                  label: 'Mon réseau',
                  linkProps: { href: '/coop/mon-reseau/' },
                },
                {
                  label: 'Annuaire des lieux d’activités',
                  linkProps: { href: '/coop/mon-reseau/lieux' },
                },
              ],
            }}
            backButton={{
              label: retourLabel,
              href: retourHref,
            }}
          />
        </main>
      </div>
    </>
  )
}

export default LieuActiviteDetailPage
