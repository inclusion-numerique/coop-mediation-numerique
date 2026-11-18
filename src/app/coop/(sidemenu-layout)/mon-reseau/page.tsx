import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/implementation/session/authenticateUser'
import { hrefDuReseau } from '@/features/mon-reseau/ui/liens'
import { DEPARTEMENT_PAR_DEFAUT } from '@/libraries/departement'
import { getUserDepartement } from '@/libraries/departement/getUserDepartement'

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
