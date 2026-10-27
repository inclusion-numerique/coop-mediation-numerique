import { metadataTitle } from '@app/web/app/metadataTitle'
import { usageDesTags } from '@app/web/features/tags/abilities/mesurer-l-usage-des-tags'
import { UsageDesTagsPage } from '@app/web/features/tags/abilities/mesurer-l-usage-des-tags/ui'

export const metadata = {
  title: metadataTitle('Tags'),
}

const Page = async () => <UsageDesTagsPage {...(await usageDesTags())} />

export default Page
