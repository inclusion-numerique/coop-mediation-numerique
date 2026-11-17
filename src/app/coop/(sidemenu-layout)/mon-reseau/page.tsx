import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@/auth/authenticateUser'
import { getUserDepartement } from '@/auth/getUserDepartement'
import { hrefDuReseau } from '@/features/mon-reseau/ui/liens'
import { DEPARTEMENT_PAR_DEFAUT } from '@/libraries/departement'

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
