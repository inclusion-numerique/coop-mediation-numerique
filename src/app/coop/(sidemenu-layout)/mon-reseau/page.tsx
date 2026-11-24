import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { hrefDuReseau } from '@/features/mon-reseau/ui/presenters/liens.presenter'
import { DEPARTEMENT_PAR_DEFAUT } from '@/libraries/departement'
import { getUserDepartement } from '@/libraries/departement/get-user-departement'

export const metadata: Metadata = {
  title: metadataTitle('Mon réseau'),
}

const Page = async () => {
  const user = await authenticateMediateurOrCoordinateur()

  redirect(
    hrefDuReseau(getUserDepartement(user)?.code ?? DEPARTEMENT_PAR_DEFAUT),
  )
}

export default Page
