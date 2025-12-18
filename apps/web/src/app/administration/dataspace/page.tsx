import { metadataTitle } from '@app/web/app/metadataTitle'
import DataspacePage from '@app/web/features/dataspace/use-cases/administration/DataspacePage'

export const metadata = {
  title: metadataTitle('Dataspace'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = () => <DataspacePage />

export default Page
