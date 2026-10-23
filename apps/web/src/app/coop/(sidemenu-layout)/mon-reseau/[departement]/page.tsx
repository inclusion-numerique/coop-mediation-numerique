import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { consulterLeReseauDuDepartement } from '@app/web/features/mon-reseau/abilities/consulter-le-reseau-du-departement'
import { ReseauDuDepartementPage } from '@app/web/features/mon-reseau/abilities/consulter-le-reseau-du-departement/ui'
import { departementDuCode } from '@app/web/libraries/departement'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Parametres = { params: Promise<{ departement: string }> }

export const generateMetadata = async ({
  params,
}: Parametres): Promise<Metadata> => {
  const departement = departementDuCode((await params).departement)

  return departement.success
    ? { title: metadataTitle(`Mon réseau - ${departement.data.nom}`) }
    : notFound()
}

const Page = async ({ params }: Parametres) => {
  const user = await authenticateMediateurOrCoordinateur()
  const reseau = await consulterLeReseauDuDepartement(
    (await params).departement,
  )

  return reseau.success ? (
    <ReseauDuDepartementPage
      reseau={reseau.data}
      estConseillerNumerique={user.isConseillerNumerique}
    />
  ) : (
    notFound()
  )
}

export default Page
