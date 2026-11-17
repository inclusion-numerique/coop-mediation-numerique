import { AccompagnementPieChart } from '@app/web/libs/statistiques/AccompagnementPieChart'
import { canauxAccompagnementColors } from '@app/web/libs/statistiques/couleurs'
import { QuantifiedShareLegend } from '@app/web/libs/statistiques/QuantifiedShareLegend'
import type { RepartitionPresentee } from '../repartition.presenter'

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
