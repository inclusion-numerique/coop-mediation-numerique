import { notFound } from 'next/navigation'
import { declencherSynchronisationAction } from '@/app/_actions/rdvsp/declencher-synchronisation.action'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { compteRdvDetaille } from '@/features/rdvsp/abilities/administrer-comptes-rdv/implementations/prisma/compte-rdv-detaille.query'
import { AdministrationRdvspUserPage } from '@/features/rdvsp/abilities/administrer-comptes-rdv/ui/pages/AdministrationRdvspUserPage'
import { DECLENCHER_SYNCHRONISATION_ACTION_KEY } from '@/features/rdvsp/action/declencher-synchronisation.key'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Rendez-vous Service Public - Utilisateur'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  await authenticateAdmin()
  const { id } = await params
  const data = await compteRdvDetaille({
    userId: id,
  })

  if (!data) {
    notFound()
    return null
  }

  return (
    <ClientBinder
      bind={DECLENCHER_SYNCHRONISATION_ACTION_KEY}
      to={declencherSynchronisationAction}
    >
      <AdministrationRdvspUserPage data={data} />
    </ClientBinder>
  )
}

export default Page
