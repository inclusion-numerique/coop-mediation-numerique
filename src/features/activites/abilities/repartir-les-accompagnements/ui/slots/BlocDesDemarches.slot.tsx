import { DemarchesDesAccompagnements } from '../components/DemarchesDesAccompagnements'
import type { RepartitionPresentee } from '../presenters/repartition.presenter'

export const BlocDesDemarches = async ({
  pourImpression,
  repartition,
}: {
  repartition: RepartitionPresentee | Promise<RepartitionPresentee>
  pourImpression?: boolean
}) => (
  <DemarchesDesAccompagnements
    thematiquesDemarches={(await repartition).thematiquesDemarches}
    pourImpression={pourImpression}
  />
)
