import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import MonReseauPage from '@app/web/features/mon-reseau/components/MonReseauPage'
import { getDepartementFromCodeOrThrowNotFound } from '@app/web/features/mon-reseau/getDepartementFromCodeOrThrowNotFound'
import { getMonReseauPageData } from '@app/web/features/mon-reseau/getMonReseauPageData'
import type { Metadata } from 'next'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ departement: string }>
}): Promise<Metadata> => {
  const { departement: departementCode } = await params
  const departement = getDepartementFromCodeOrThrowNotFound(departementCode)
  return {
    title: metadataTitle(`Mon réseau - ${departement.nom}`),
  }
}

const Page = async ({
  params,
}: {
  params: Promise<{ departement: string }>
}) => {
  const user = await authenticateMediateurOrCoordinateur()

  const { departement: departementCode } = await params
  const departement = getDepartementFromCodeOrThrowNotFound(departementCode)
  const data = await getMonReseauPageData({ departementCode: departement.code })

  return (
    <MonReseauPage
      {...data}
      isConseillerNumerique={user.isConseillerNumerique}
    />
  )
}

export default Page
