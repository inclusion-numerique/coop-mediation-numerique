import { ThematiquesDesAccompagnements } from '../components/ThematiquesDesAccompagnements'
import type { RepartitionPresentee } from '../presenters/repartition.presenter'

export const BlocDesThematiques = async ({
  pourImpression,
  repartition,
}: {
  repartition: RepartitionPresentee | Promise<RepartitionPresentee>
  pourImpression?: boolean
}) => (
  <ThematiquesDesAccompagnements
    thematiques={(await repartition).thematiques}
    pourImpression={pourImpression}
  />
)
