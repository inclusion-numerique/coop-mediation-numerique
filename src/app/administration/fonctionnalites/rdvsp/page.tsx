import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
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
