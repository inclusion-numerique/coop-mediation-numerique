import { AccompagnementBarChart } from '@app/web/libs/statistiques/AccompagnementBarChart'
import type { LabelAndCount } from '@app/web/libs/statistiques/quantifiedShare'

export const GraphiquesImprimes = ({
  accompagnementsParMois,
  accompagnementsParJour,
}: {
  accompagnementsParMois: LabelAndCount[]
  accompagnementsParJour: LabelAndCount[]
}) => (
  <>
    <h3 className="fr-h5 fr-mt-6v">Nombre d’accompagnements par mois</h3>
    <AccompagnementBarChart
      data={accompagnementsParMois}
      height={200}
      isAnimationActive={false}
    />
    <h3 className="fr-h5 fr-mt-6v">Nombre d’accompagnements par jour</h3>
    <AccompagnementBarChart
      data={accompagnementsParJour}
      height={200}
      isAnimationActive={false}
    />
  </>
)
