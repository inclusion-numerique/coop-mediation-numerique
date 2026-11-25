import { MaterielsUtilises } from '../components/MaterielsUtilises'
import type { RepartitionPresentee } from '../presenters/repartition.presenter'

export const BlocDesMateriels = async ({
  repartition,
}: {
  repartition: RepartitionPresentee | Promise<RepartitionPresentee>
}) => <MaterielsUtilises materiels={(await repartition).materiels} />
