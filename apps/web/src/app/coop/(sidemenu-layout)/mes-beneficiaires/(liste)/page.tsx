import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { listerBeneficiaires } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/implementation'
import { presentMesBeneficiaires } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/ui/components/lister-beneficiaires.presenter'
import {
  type MesBeneficiairesSearchParams,
  toListerBeneficiairesQuery,
} from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/ui/components/lister-beneficiaires-search-params'
import { MesBeneficiairesListePage } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/ui/pages/MesBeneficiairesListePage'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Mes bénéficiaires'),
}

// Route = orchestration : authentifie, interroge l'ability, applique le
// presenter, puis délègue le rendu au composant de page pur.
const MesBeneficiairesPage = async (props: {
  searchParams: Promise<MesBeneficiairesSearchParams>
}) => {
  const searchParams = await props.searchParams
  const user = await authenticateMediateur()
  const query = toListerBeneficiairesQuery(searchParams)

  const view = presentMesBeneficiaires(
    await listerBeneficiaires({
      mediateurId: MediateurId(user.mediateur.id),
      ...query,
    }),
    query.search,
  )

  return <MesBeneficiairesListePage view={view} searchParams={searchParams} />
}

export default MesBeneficiairesPage
