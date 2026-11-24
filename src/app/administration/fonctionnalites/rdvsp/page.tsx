import { metadataTitle } from '@/configuration/projet/metadata-title'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { comptesRdv } from '@/features/rdvsp/abilities/administrer-comptes-rdv/implementations/prisma/comptes-rdv.query'
import AdministrationRdvspPage from '@/features/rdvsp/abilities/administrer-comptes-rdv/ui/pages/AdministrationRdvspPage'

export const metadata = {
  title: metadataTitle('Rendez-vous Service Public'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async () => {
  await authenticateAdmin()
  const data = await comptesRdv()

  return <AdministrationRdvspPage data={data} />
}

export default Page
