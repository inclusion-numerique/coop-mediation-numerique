import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { LieuActivitePageContent } from '@app/web/features/lieux-activite/components/LieuActivitePageContent'
import { getLieuActivitePageData } from '@app/web/features/lieux-activite/getLieuActivitePageData'
import { getDepartementFromCodeOrThrowNotFound } from '@app/web/features/mon-reseau/getDepartementFromCodeOrThrowNotFound'
import { contentId } from '@app/web/utils/skipLinks'
import { redirect } from 'next/navigation'
import React from 'react'

const LieuActiviteDetailPage = async (props: {
  params: Promise<{ id: string; departement: string }>
}) => {
  const params = await props.params
  await authenticateUser(
    `/connexion?suivant=/mon-reseau/${params.departement}/lieux/${params.id}`,
  )

  const { departement: departementCode, id } = params
  getDepartementFromCodeOrThrowNotFound(departementCode)

  const data = await getLieuActivitePageData({ id })

  if (!data) {
    redirect('/coop/lieux-activite')
  }

  return (
    <>
      <SkipLinksPortal />
      <main id={contentId} className="fr-container fr-flex">
        <LieuActivitePageContent data={data} />
      </main>
    </>
  )
}

export default LieuActiviteDetailPage
