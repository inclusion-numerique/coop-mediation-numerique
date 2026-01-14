import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { getDepartementFromCodeOrThrowNotFound } from '@app/web/features/mon-reseau/getDepartementFromCodeOrThrowNotFound'
import { ActeurDetailPage } from '@app/web/features/mon-reseau/use-cases/acteurs/ActeurDetailPage'
import { getActeurDetailPageData } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDetailPageData'
import { prismaClient } from '@app/web/prismaClient'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ userId: string; departement: string }>
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
    title: metadataTitle(`${user.name} | Mon réseau`),
  }
}

const Page = async ({
  params: rawParams,
}: {
  params: Promise<{ userId: string; departement: string }>
}) => {
  const sessionUser = await authenticateMediateurOrCoordinateur()

  const params = await rawParams

  const { userId, departement: departementCode } = params
  getDepartementFromCodeOrThrowNotFound(departementCode)

  const data = await getActeurDetailPageData({
    userId,
    sessionUser,
  })

  if (data == null) {
    return notFound()
  }

  return <ActeurDetailPage data={data} departementCode={departementCode} />
}

export default Page
