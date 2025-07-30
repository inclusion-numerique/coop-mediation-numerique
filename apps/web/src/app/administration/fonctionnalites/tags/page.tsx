import { metadataTitle } from '@app/web/app/metadataTitle'
import { AdministrationTagsPage } from '@app/web/features/activites/use-cases/tags/administration/AdministrationTagsPage'
import { getAdministrationTagsData } from '@app/web/features/activites/use-cases/tags/administration/getAdministrationTagsData'

export const metadata = {
  title: metadataTitle('Tags'),
}

const Page = async () => {
  const { tagsCreators, tagsUsedInCRAs, mostUsedTags } =
    await getAdministrationTagsData()

  return (
    <AdministrationTagsPage
      tagsCreators={tagsCreators}
      tagsUsedInCRAs={tagsUsedInCRAs}
      mostUsedTags={mostUsedTags}
    />
  )
}

export default Page
