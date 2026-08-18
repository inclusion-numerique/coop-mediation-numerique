import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { getAccueilPageDataFor } from '@app/web/features/accueil/db/accueil-page-data.query'
import { Accueil } from '@app/web/features/accueil/ui/pages/Accueil'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: metadataTitle('Accueil'),
}

const Page = async () => {
  const { id: userId, ...user } = await authenticateMediateurOrCoordinateur()

  const dashboardPageData = await getAccueilPageDataFor({ ...user, id: userId })

  return (
    <Accueil
      {...user}
      userId={userId}
      {...dashboardPageData}
      isMediateur={user.mediateur?.id != null}
      isCoordinateur={user.coordinateur?.id != null}
    />
  )
}

export default Page
