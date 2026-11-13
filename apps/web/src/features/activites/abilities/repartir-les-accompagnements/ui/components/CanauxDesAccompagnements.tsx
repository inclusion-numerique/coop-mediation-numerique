import { AccompagnementPieChart } from '@app/web/libs/statistiques/AccompagnementPieChart'
import { canauxAccompagnementColors } from '@app/web/libs/statistiques/couleurs'
import { QuantifiedShareLegend } from '@app/web/libs/statistiques/QuantifiedShareLegend'
import type { RepartitionPresentee } from '../repartition.presenter'

export const CanauxDesAccompagnements = ({
  typeLieu,
}: {
  typeLieu: RepartitionPresentee['typeLieu']
}) => (
  <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
    <h3 className="fr-text--md fr-mb-4v">Canaux des accompagnements</h3>
    <div className="fr-flex fr-align-items-center">
      <AccompagnementPieChart
        className="fr-flex-shrink-0"
        size={80}
        width={18}
        data={typeLieu}
        colors={canauxAccompagnementColors}
      />
      <QuantifiedShareLegend
        className="fr-pl-3w"
        quantifiedShares={typeLieu}
        colors={canauxAccompagnementColors}
      />
    </div>
  </div>
)
