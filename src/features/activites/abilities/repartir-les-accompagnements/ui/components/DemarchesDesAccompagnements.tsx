import { thematiquesAccompagnementColors } from '@/features/activites/ui/labels/couleurs.labels'
import { ProgressItemList } from '@/libraries/proportions/composants'
import type { RepartitionPresentee } from '../presenters/repartition.presenter'

const desc = (
  { count: countA }: { count: number },
  { count: countB }: { count: number },
) => countB - countA

const toMaxProportion = (
  max: number,
  { proportion }: { proportion: number },
) => (proportion > max ? proportion : max)

export const DemarchesDesAccompagnements = ({
  thematiquesDemarches,
  pourImpression = false,
}: {
  thematiquesDemarches: RepartitionPresentee['thematiquesDemarches']
  pourImpression?: boolean | undefined
}) => (
  <ProgressItemList
    items={[...thematiquesDemarches].sort(desc)}
    colors={thematiquesAccompagnementColors}
    maxProportion={thematiquesDemarches.reduce(toMaxProportion, 0)}
    oneLineLabel={!pourImpression}
    tooltipKey={pourImpression ? undefined : 'demarches'}
  />
)
