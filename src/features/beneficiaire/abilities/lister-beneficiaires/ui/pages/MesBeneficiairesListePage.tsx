import { BeneficiairesEmpty } from '../components/BeneficiairesEmpty'
import { BeneficiairesListHeader } from '../components/BeneficiairesListHeader'
import { BeneficiairesNoResults } from '../components/BeneficiairesNoResults'
import { BeneficiairesResults } from '../components/BeneficiairesResults'
import type { MesBeneficiairesView } from '../presenters/lister-beneficiaires.presenter'
import {
  type MesBeneficiairesSearchParams,
  toDataTableUrlState,
} from '../search-params/lister-beneficiaires.search-params'

const BASE_HREF = '/coop/mes-beneficiaires'

/**
 * Composant de page pur : rend la vue déjà calculée, sans aucun accès données.
 * L'orchestration (auth, requête de l'ability, presenter) vit dans la route Next,
 * qui fournit aussi la server action de suppression — voir
 * DeleteBulkBeneficiairesModalContent pour la raison.
 */
export const MesBeneficiairesListePage = ({
  view,
  searchParams,
}: {
  view: MesBeneficiairesView
  searchParams: MesBeneficiairesSearchParams
}) => {
  // Aucun bénéficiaire enregistré : ni recherche ni table.
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
