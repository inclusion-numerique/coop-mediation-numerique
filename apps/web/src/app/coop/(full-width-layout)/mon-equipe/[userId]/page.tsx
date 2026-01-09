import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { getDepartementCodeForLieu } from '@app/web/features/mon-reseau/getDepartementCodeForLieu'
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
}: {
  params: Promise<{ userId: string }>
}) => {
  const sessionUser = await authenticateCoordinateur()

  const params = await rawParams

  const { userId } = params

  const data = await getActeurDetailPageData({
    userId,
    sessionUser,
  })

  if (data == null) {
    return notFound()
  }

  // Get departement from first lieu d'activité or emploi structure
  const departementCode = getDepartementCodeForLieu(
    data.lieuxActivites[0] ?? data.emploi?.structure ?? { codeInsee: null },
  )

  return <ActeurDetailPage data={data} departementCode={departementCode} />
}

export default Page
