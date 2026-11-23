import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticateUser'
import { usageDesTags } from '@/features/tags/abilities/mesurer-l-usage-des-tags'
import { UsageDesTagsPage } from '@/features/tags/abilities/mesurer-l-usage-des-tags/ui'

export const metadata = {
  title: metadataTitle('Tags'),
}

const Page = async () => {
  await authenticateAdmin()
  return <UsageDesTagsPage {...(await usageDesTags())} />
}

export default Page
