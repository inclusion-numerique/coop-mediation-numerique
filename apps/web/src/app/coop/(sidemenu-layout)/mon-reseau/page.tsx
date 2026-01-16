import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { getUserDepartement } from '@app/web/features/utilisateurs/utils/getUserDepartement'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Mon réseau'),
}

const DEFAULT_DEPARTEMENT_CODE = '75'

const Page = async () => {
  const user = await authenticateMediateurOrCoordinateur()

  const userDepartement = getUserDepartement(user)
  const departementCode = userDepartement?.code ?? DEFAULT_DEPARTEMENT_CODE

  redirect(`/coop/mon-reseau/${departementCode}`)
}

export default Page
