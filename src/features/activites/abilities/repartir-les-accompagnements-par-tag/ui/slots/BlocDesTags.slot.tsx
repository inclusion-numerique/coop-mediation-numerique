import { TagsDesAccompagnements } from '../components/TagsDesAccompagnements'
import type { parTagPresentes } from '../presenters/par-tag.presenter'

export const BlocDesTags = async ({
  pourImpression,
  tags,
}: {
  tags:
    | ReturnType<typeof parTagPresentes>
    | Promise<ReturnType<typeof parTagPresentes>>
  pourImpression?: boolean
}) => (
  <TagsDesAccompagnements tags={await tags} pourImpression={pourImpression} />
)
