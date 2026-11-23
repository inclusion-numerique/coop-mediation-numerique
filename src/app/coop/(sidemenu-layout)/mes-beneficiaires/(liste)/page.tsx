import type { Metadata } from 'next'
import { supprimerBeneficiairesAction } from '@/app/_actions/beneficiaire/supprimer-beneficiaires.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticateUser'
import { listerBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/implementations'
import { presentMesBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/ui/components/lister-beneficiaires.presenter'
import {
  type MesBeneficiairesSearchParams,
  toListerBeneficiairesQuery,
} from '@/features/beneficiaire/abilities/lister-beneficiaires/ui/components/lister-beneficiaires-search-params'
import { SUPPRIMER_DES_BENEFICIAIRES_KEY } from '@/features/beneficiaire/abilities/lister-beneficiaires/ui/components/supprimer-des-beneficiaires.key'
import { MesBeneficiairesListePage } from '@/features/beneficiaire/abilities/lister-beneficiaires/ui/pages/MesBeneficiairesListePage'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

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

  return (
    <ClientBinder
      bind={SUPPRIMER_DES_BENEFICIAIRES_KEY}
      to={supprimerBeneficiairesAction}
    >
      <MesBeneficiairesListePage view={view} searchParams={searchParams} />
    </ClientBinder>
  )
}

export default MesBeneficiairesPage
