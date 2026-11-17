import { thematiquesAccompagnementColors } from '@app/web/libs/statistiques/couleurs'
import { ProgressItemList } from '@app/web/libs/statistiques/ProgressItemList'
import type { RepartitionPresentee } from '../repartition.presenter'

const desc = (
  { count: countA }: { count: number },
  { count: countB }: { count: number },
) => countB - countA

const toMaxProportion = (
  max: number,
  { proportion }: { proportion: number },
) => (proportion > max ? proportion : max)

export const ThematiquesDesAccompagnements = ({
  thematiques,
  pourImpression = false,
}: {
  thematiques: RepartitionPresentee['thematiques']
  pourImpression?: boolean
}) => (
  <ProgressItemList
    items={[...thematiques].sort(desc)}
    colors={thematiquesAccompagnementColors}
    maxProportion={thematiques.reduce(toMaxProportion, 0)}
    oneLineLabel={!pourImpression}
    tooltipKey={pourImpression ? undefined : 'thematiques'}
  />
)
