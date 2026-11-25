import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { nombreDeLieuxDuDepartement } from '@/features/lieux-activite/abilities/lister-les-lieux-du-departement/implementations/prisma/nombre-de-lieux-du-departement.query'
import { consulterLeReseauDuDepartement } from '@/features/mon-reseau/abilities/consulter-le-reseau-du-departement/implementations/prisma/reseau-du-departement.query'
import { default as ReseauDuDepartementPage } from '@/features/mon-reseau/abilities/consulter-le-reseau-du-departement/ui/pages/ReseauDuDepartementPage'
import { departementDuCode } from '@/libraries/departement'

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
    { nombreDeLieuxDuDepartement },
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
