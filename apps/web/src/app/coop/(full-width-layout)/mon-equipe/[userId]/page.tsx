import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { ActeurDetailPage } from '@app/web/features/mon-reseau/use-cases/acteurs/ActeurDetailPage'
import { getActeurDetailPageData } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDetailPageData'
import { prismaClient } from '@app/web/prismaClient'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ userId: string }>
}): Promise<Metadata> => {
  const { userId } = await params

  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { name: true },
  })

  if (!user) {
    return notFound()
  }

  return {
    title: metadataTitle(`${user.name} | Mon équipe`),
  }
}

const Page = async ({
  params: rawParams,
  searchParams: rawSearchParams,
}: {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const sessionUser = await authenticateCoordinateur()

  const params = await rawParams
  const searchParams = await rawSearchParams

  const { userId } = params
  const { retour } = searchParams

  // Default retour for mon-equipe context
  const retourHref = retour ?? '/coop/mon-equipe'
  const retourLabel = 'Mon équipe'

  const data = await getActeurDetailPageData({
    userId,
    retourHref,
    retourLabel,
    sessionUser,
  })

  if (data == null) {
    return notFound()
  }

  return <ActeurDetailPage data={data} departementCode={null} />
}

export default Page
