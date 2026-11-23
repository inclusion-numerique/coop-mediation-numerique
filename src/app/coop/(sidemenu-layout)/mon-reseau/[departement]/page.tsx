import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/implementations/session/authenticateUser'
import { nombreDeLieuxDuDepartement } from '@/features/lieux-activite/abilities/lister-les-lieux-du-departement'
import { consulterLeReseauDuDepartement } from '@/features/mon-reseau/abilities/consulter-le-reseau-du-departement'
import { ReseauDuDepartementPage } from '@/features/mon-reseau/abilities/consulter-le-reseau-du-departement/ui'
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
