import { authenticateUser } from '@app/web/auth/authenticateUser'
import { getEquipesFromSessionUser } from '@app/web/features/activites/use-cases/tags/equipe'
import {
  getTagsPageDataFor,
  TagSearchParams,
} from '@app/web/features/activites/use-cases/tags/list/get-tags-page-data-for'
import { ListTagsPage } from '@app/web/features/activites/use-cases/tags/list/ListTagsPage'

const Page = async (props: { searchParams: Promise<TagSearchParams> }) => {
  const searchParams = await props.searchParams
  const user = await authenticateUser()
  const tags = await getTagsPageDataFor(user)(searchParams)
  const equipes = getEquipesFromSessionUser(user)

  return (
    <ListTagsPage
      {...tags}
      searchParams={searchParams}
      isMediateur={user.mediateur != null}
      isCoordinateur={user.coordinateur != null}
      equipes={equipes}
      baseHref="/coop/tags"
    />
  )
}

export default Page
