import { metadataTitle } from '@app/web/app/metadataTitle'
import { AdministrationRDVSPPage } from '@app/web/features/rdvsp/administration/AdministrationRDVSPPage'
import { usersRDV } from '@app/web/features/rdvsp/administration/db/usersRDV'
import { usersWithFeatureFlag } from '@app/web/features/rdvsp/administration/db/usersWithFeatureFlag'

export const metadata = {
  title: metadataTitle('Rendez-vous Service Public'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async () => {
  const users = await usersWithFeatureFlag()
  const sortedData = await usersRDV(users)

  return <AdministrationRDVSPPage users={users} sortedData={sortedData} />
}

export default Page
