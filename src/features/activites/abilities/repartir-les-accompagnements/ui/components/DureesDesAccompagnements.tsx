import { AccompagnementPieChart } from '@/features/activites/ui/components/AccompagnementPieChart'
import { dureesAccompagnementColors } from '@/features/activites/ui/labels/couleurs.labels'
import { QuantifiedShareLegend } from '@/libraries/proportions/QuantifiedShareLegend'
import type { RepartitionPresentee } from '../presenters/repartition.presenter'

export const DureesDesAccompagnements = ({
  durees,
}: {
  durees: RepartitionPresentee['durees']
}) => (
  <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
    <h3 className="fr-text--md fr-mb-4v">Durée des accompagnements</h3>
    <div className="fr-flex fr-align-items-center">
      <AccompagnementPieChart
        className="fr-flex-shrink-0"
        size={80}
        width={18}
        data={durees}
        colors={dureesAccompagnementColors}
      />
      <QuantifiedShareLegend
        className="fr-pl-3w"
        quantifiedShares={durees}
        colors={dureesAccompagnementColors}
        oneLineLabel
      />
    </div>
  </div>
)
