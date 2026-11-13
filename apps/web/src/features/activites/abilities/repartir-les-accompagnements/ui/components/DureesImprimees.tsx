import { AccompagnementPieChart } from '@app/web/libs/statistiques/AccompagnementPieChart'
import { dureesAccompagnementColors } from '@app/web/libs/statistiques/couleurs'
import { QuantifiedShareLegend } from '@app/web/libs/statistiques/QuantifiedShareLegend'
import type { RepartitionPresentee } from '../repartition.presenter'

export const DureesImprimees = ({
  durees,
}: {
  durees: RepartitionPresentee['durees']
}) => (
  <>
    <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Durée des accompagnements</h3>
    <small role="note" className="fr-mb-6v fr-display-block">
      Répartition des accompagnements enregistrées par durée.
    </small>
    <div className="fr-flex fr-align-items-center">
      <AccompagnementPieChart
        size={128}
        data={durees}
        colors={dureesAccompagnementColors}
        isAnimationActive={false}
      />
      <QuantifiedShareLegend
        className="fr-pl-3w"
        quantifiedShares={durees}
        colors={dureesAccompagnementColors}
      />
    </div>
  </>
)
