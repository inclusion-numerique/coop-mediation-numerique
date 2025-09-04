import { authenticateUser } from '@app/web/auth/authenticateUser'
import {
  getTagsPageDataFor,
  TagSearchParams,
} from '@app/web/features/activites/use-cases/tags/list/get-tags-page-data-for'
import { ListTagsPage } from '@app/web/features/activites/use-cases/tags/list/ListTagsPage'

const Page = async (props: { searchParams: Promise<TagSearchParams> }) => {
  const searchParams = await props.searchParams
  const user = await authenticateUser()
  const tags = await getTagsPageDataFor(user)(searchParams)

  return (
    <ListTagsPage
      {...tags}
      searchParams={searchParams}
      isMediateur={user.mediateur != null}
      isCoordinateur={user.coordinateur != null}
      baseHref="/coop/tags"
    />
  )
}

export default Page
