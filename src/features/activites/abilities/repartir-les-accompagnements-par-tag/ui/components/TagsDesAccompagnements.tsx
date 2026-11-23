import { tagsColor } from '@/features/activites/ui/presenters/graphiques/couleurs'
import { ProgressItemList } from '@/libraries/proportions/ProgressItemList'
import type { parTagPresentes } from '../presenters/par-tag.presenter'

const desc = (
  { count: countA }: { count: number },
  { count: countB }: { count: number },
) => countB - countA

const toMaxProportion = (
  max: number,
  { proportion }: { proportion: number },
) => (proportion > max ? proportion : max)

export const TagsDesAccompagnements = ({
  tags,
  pourImpression = false,
}: {
  tags: ReturnType<typeof parTagPresentes>
  pourImpression?: boolean
}) => (
  <ProgressItemList
    items={[...tags].sort(desc)}
    colors={tagsColor}
    maxProportion={tags.reduce(toMaxProportion, 0)}
    oneLineLabel={!pourImpression}
    tooltipKey={pourImpression ? undefined : 'tags'}
  />
)
