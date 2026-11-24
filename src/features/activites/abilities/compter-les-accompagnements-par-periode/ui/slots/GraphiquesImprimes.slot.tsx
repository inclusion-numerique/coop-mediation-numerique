import { AccompagnementBarChart } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/components/AccompagnementBarChart'
import type { LabelAndCount } from '@/libraries/proportions/quantified-share'

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
