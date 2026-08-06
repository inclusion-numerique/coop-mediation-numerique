import { BeneficiairesEmpty } from '../components/BeneficiairesEmpty'
import { BeneficiairesListHeader } from '../components/BeneficiairesListHeader'
import { BeneficiairesNoResults } from '../components/BeneficiairesNoResults'
import { BeneficiairesResults } from '../components/BeneficiairesResults'
import type { SupprimerBeneficiaires } from '../components/DeleteBulkBeneficiairesModalContent'
import type { MesBeneficiairesView } from '../components/lister-beneficiaires.presenter'
import {
  type MesBeneficiairesSearchParams,
  toDataTableUrlState,
} from '../components/lister-beneficiaires-search-params'

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
  supprimerBeneficiaires,
}: {
  view: MesBeneficiairesView
  searchParams: MesBeneficiairesSearchParams
  supprimerBeneficiaires: SupprimerBeneficiaires
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
        <BeneficiairesResults
          view={view}
          state={state}
          baseHref={BASE_HREF}
          supprimerBeneficiaires={supprimerBeneficiaires}
        />
      )}
    </>
  )
}
