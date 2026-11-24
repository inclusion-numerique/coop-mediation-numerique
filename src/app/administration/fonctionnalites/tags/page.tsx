import { metadataTitle } from '@/configuration/projet/metadata-title'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { usageDesTags } from '@/features/tags/abilities/mesurer-l-usage-des-tags/implementations/prisma/usage-des-tags.query'
import { UsageDesTagsPage } from '@/features/tags/abilities/mesurer-l-usage-des-tags/ui/pages/UsageDesTagsPage'

export const metadata = {
  title: metadataTitle('Tags'),
}

const Page = async () => {
  await authenticateAdmin()
  return <UsageDesTagsPage {...(await usageDesTags())} />
}

export default Page
