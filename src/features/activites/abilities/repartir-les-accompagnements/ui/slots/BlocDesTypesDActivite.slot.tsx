import { TypesDActivite } from '../components/TypesDActivite'
import type { RepartitionPresentee } from '../presenters/repartition.presenter'

type Totaux = {
  readonly activites: { readonly collectifs: { readonly total: number } }
}

export const BlocDesTypesDActivite = async ({
  repartition,
  totaux,
}: {
  repartition: RepartitionPresentee | Promise<RepartitionPresentee>
  totaux: Totaux | Promise<Totaux>
}) => {
  const [activites, { activites: parType }] = await Promise.all([
    repartition,
    totaux,
  ])
  return (
    <TypesDActivite
      typeActivites={activites.typeActivites}
      ateliers={parType.collectifs.total}
    />
  )
}
