import { metadataTitle } from '@/app/metadataTitle'
import { usageDesTags } from '@/features/tags/abilities/mesurer-l-usage-des-tags'
import { UsageDesTagsPage } from '@/features/tags/abilities/mesurer-l-usage-des-tags/ui'

export const metadata = {
  title: metadataTitle('Tags'),
}

const Page = async () => <UsageDesTagsPage {...(await usageDesTags())} />

export default Page
