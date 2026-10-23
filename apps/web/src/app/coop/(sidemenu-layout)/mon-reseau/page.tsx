import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { getUserDepartement } from '@app/web/auth/getUserDepartement'
import { hrefDuReseau } from '@app/web/features/mon-reseau/ui/liens'
import { DEPARTEMENT_PAR_DEFAUT } from '@app/web/libraries/departement'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

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
