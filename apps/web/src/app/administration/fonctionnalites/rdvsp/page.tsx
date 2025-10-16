import { metadataTitle } from '@app/web/app/metadataTitle'
import AdministrationRdvspPage from '@app/web/features/rdvsp/administration/AdministrationRdvspPage'
import { getAdministrationRdvspData } from '@app/web/features/rdvsp/administration/getAdministrationRdvspData'

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
