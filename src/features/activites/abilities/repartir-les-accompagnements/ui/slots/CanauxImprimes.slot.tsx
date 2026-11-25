import { AccompagnementPieChart } from '@/features/activites/ui/components/AccompagnementPieChart'
import { canauxAccompagnementColors } from '@/features/activites/ui/labels/couleurs.labels'
import { QuantifiedShareLegend } from '@/libraries/proportions/composants'
import type { RepartitionPresentee } from '../presenters/repartition.presenter'

export const CanauxImprimes = ({
  typeLieu,
}: {
  typeLieu: RepartitionPresentee['typeLieu']
}) => (
  <>
    <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Canaux des accompagnements</h3>
    <small role="note" className="fr-mb-6v fr-display-block">
      Répartition des accompagnements enregistrées par canal.
    </small>
    <div className="fr-flex fr-align-items-center">
      <AccompagnementPieChart
        size={128}
        data={typeLieu}
        colors={canauxAccompagnementColors}
        isAnimationActive={false}
      />
      <QuantifiedShareLegend
        className="fr-pl-3w"
        quantifiedShares={typeLieu}
        colors={canauxAccompagnementColors}
      />
    </div>
  </>
)
