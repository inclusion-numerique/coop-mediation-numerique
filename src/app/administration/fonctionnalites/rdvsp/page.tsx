import { metadataTitle } from '@app/web/app/metadataTitle'
import { getAdministrationRdvspData } from '@app/web/features/rdvsp/abilities/administrer-comptes-rdv/implementation/prisma/comptes-rdv.query'
import AdministrationRdvspPage from '@app/web/features/rdvsp/abilities/administrer-comptes-rdv/ui/pages/AdministrationRdvspPage'

export const metadata = {
  title: metadataTitle('Rendez-vous Service Public'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async () => {
  const data = await getAdministrationRdvspData()

  return <AdministrationRdvspPage data={data} />
}

export default Page
