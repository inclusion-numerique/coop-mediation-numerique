import { CanauxDesAccompagnements } from '../components/CanauxDesAccompagnements'
import { DureesDesAccompagnements } from '../components/DureesDesAccompagnements'
import type { RepartitionPresentee } from '../presenters/repartition.presenter'

export const BlocDesCanauxEtDurees = async ({
  repartition,
}: {
  repartition: RepartitionPresentee | Promise<RepartitionPresentee>
}) => {
  const activites = await repartition
  return (
    <>
      <CanauxDesAccompagnements typeLieu={activites.typeLieu} />
      <DureesDesAccompagnements durees={activites.durees} />
    </>
  )
}
