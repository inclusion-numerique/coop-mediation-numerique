import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
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
    title: metadataTitle(`${user.name} | Mon réseau`),
  }
}

const parseRetourParams = (retour?: string) => {
  let retourHref = '/coop/mon-reseau'
  let retourLabel = 'Mon réseau'

  if (retour) {
    try {
      const retourUrl = new URL(retour, 'http://localhost')
      retourHref = retour

      // Determine label based on the retour path
      if (retourUrl.pathname.includes('/mon-equipe')) {
        retourLabel = 'Mon équipe'
      } else if (retourUrl.pathname.includes('/mes-equipes')) {
        retourLabel = 'Mon équipe'
      } else if (retourUrl.pathname.includes('/mon-reseau/acteurs')) {
        retourLabel = 'Annuaire des acteurs'
      } else if (retourUrl.pathname.includes('/mon-reseau')) {
        retourLabel = 'Mon réseau'
      }
    } catch {
      // Invalid URL, use defaults
    }
  }

  return { retourHref, retourLabel }
}

const Page = async ({
  params: rawParams,
  searchParams: rawSearchParams,
}: {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  await authenticateMediateurOrCoordinateur()

  const params = await rawParams
  const searchParams = await rawSearchParams

  const { userId } = params
  const { retour } = searchParams

  const { retourHref, retourLabel } = parseRetourParams(retour)

  const data = await getActeurDetailPageData({
    userId,
    retourHref,
    retourLabel,
  })

  if (data == null) {
    return notFound()
  }

  return <ActeurDetailPage data={data} />
}

export default Page
