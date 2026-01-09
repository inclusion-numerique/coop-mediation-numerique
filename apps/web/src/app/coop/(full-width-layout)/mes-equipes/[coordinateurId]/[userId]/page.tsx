import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { getDepartementCodeForLieu } from '@app/web/features/mon-reseau/getDepartementCodeForLieu'
import { ActeurDetailPage } from '@app/web/features/mon-reseau/use-cases/acteurs/ActeurDetailPage'
import { getActeurDetailPageData } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDetailPageData'
import { prismaClient } from '@app/web/prismaClient'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ coordinateurId: string; userId: string }>
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
    title: metadataTitle(`${user.name} | Mes équipes`),
  }
}

const Page = async ({
  params: rawParams,
  searchParams: rawSearchParams,
}: {
  params: Promise<{ coordinateurId: string; userId: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const sessionUser = await authenticateMediateurOrCoordinateur()

  const params = await rawParams
  const searchParams = await rawSearchParams

  const { coordinateurId, userId } = params
  const { retour } = searchParams

  // Default retour for mes-equipes context
  const retourHref = retour ?? `/coop/mes-equipes/${coordinateurId}`
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

  // Get departement from first lieu d'activité or emploi structure
  const departementCode = getDepartementCodeForLieu(
    data.lieuxActivites[0] ?? data.emploi?.structure ?? { codeInsee: null },
  )

  return <ActeurDetailPage data={data} departementCode={departementCode} />
}

export default Page
