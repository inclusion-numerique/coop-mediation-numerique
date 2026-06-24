import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { listerBeneficiaires } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/implementation'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { BeneficiairesEmpty } from '../components/BeneficiairesEmpty'
import { BeneficiairesListHeader } from '../components/BeneficiairesListHeader'
import { BeneficiairesNoResults } from '../components/BeneficiairesNoResults'
import { BeneficiairesResults } from '../components/BeneficiairesResults'
import { presentMesBeneficiaires } from '../components/lister-beneficiaires.presenter'
import {
  type MesBeneficiairesSearchParams,
  toDataTableUrlState,
  toListerBeneficiairesQuery,
} from '../components/lister-beneficiaires-search-params'

const BASE_HREF = '/coop/mes-beneficiaires'

export const MesBeneficiairesListePage = async ({
  searchParams,
}: {
  searchParams: MesBeneficiairesSearchParams
}) => {
  const user = await authenticateMediateur()
  const query = toListerBeneficiairesQuery(searchParams)

  const view = presentMesBeneficiaires(
    await listerBeneficiaires({
      mediateurId: MediateurId(user.mediateur.id),
      ...query,
    }),
    query.search,
  )

  // Aucun bénéficiaire enregistré : on n'affiche ni recherche ni table.
  if (view.tag === 'empty') return <BeneficiairesEmpty />

  const state = toDataTableUrlState(searchParams)

  return (
    <>
      <BeneficiairesListHeader state={state} baseHref={BASE_HREF} />
      {view.tag === 'noResults' ? (
        <BeneficiairesNoResults recherche={view.recherche} />
      ) : (
        <BeneficiairesResults view={view} state={state} baseHref={BASE_HREF} />
      )}
    </>
  )
}
