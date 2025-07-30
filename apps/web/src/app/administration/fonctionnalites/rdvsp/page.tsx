import { metadataTitle } from '@app/web/app/metadataTitle'
import { AdministrationRDVSPPage } from '@app/web/features/rdvsp/administration/AdministrationRDVSPPage'

export const metadata = {
  title: metadataTitle('RDVSP'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default AdministrationRDVSPPage
