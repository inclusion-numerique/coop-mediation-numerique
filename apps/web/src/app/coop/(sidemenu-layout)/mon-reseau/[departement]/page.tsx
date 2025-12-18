import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { departementsByCode } from '@app/web/data/collectivites-territoriales/departements'
import MonReseauPage from '@app/web/features/mon-reseau/components/MonReseauPage'
import { getMonReseauPageData } from '@app/web/features/mon-reseau/getMonReseauPageData'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Mon réseau'),
}

const Page = async ({
  params,
}: {
  params: Promise<{ departement: string }>
}) => {
  await authenticateMediateurOrCoordinateur()

  const { departement: departementCode } = await params

  if (!departementsByCode.has(departementCode)) {
    return notFound()
  }

  const data = await getMonReseauPageData({ departementCode })
  return <MonReseauPage {...data} />
}

export default Page
