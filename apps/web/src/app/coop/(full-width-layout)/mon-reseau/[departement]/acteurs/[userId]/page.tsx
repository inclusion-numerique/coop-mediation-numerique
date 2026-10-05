import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { lieuxEnListeDuMediateur } from '@app/web/features/lieux-activite/implementation'
import { getDepartementFromCodeOrThrowNotFound } from '@app/web/features/mon-reseau/getDepartementFromCodeOrThrowNotFound'
import { ActeurDetailPage } from '@app/web/features/mon-reseau/use-cases/acteurs/ActeurDetailPage'
import { getActeurDetailPageData } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDetailPageData'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
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
    lireLesLieuxDuMediateur: lieuxEnListeDuMediateur,
  })

  if (data == null) {
    return notFound()
  }

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <ActeurDetailPage data={data} departementCode={departementCode} />
    </ClientBinder>
  )
}

export default Page
