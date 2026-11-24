import { BeneficiairesEmpty } from '../components/BeneficiairesEmpty'
import { BeneficiairesListHeader } from '../components/BeneficiairesListHeader'
import { BeneficiairesNoResults } from '../components/BeneficiairesNoResults'
import { BeneficiairesResults } from '../components/BeneficiairesResults'
import type { LiensDeLaListe } from '../filtres/liste-des-beneficiaires.filtre'
import type { VueDeMesBeneficiaires } from '../presenters/lister-beneficiaires.presenter'

const BASE_HREF = '/coop/mes-beneficiaires'

/**
 * Composant de page pur : rend la vue déjà calculée, sans aucun accès données.
 * L'orchestration (auth, requête de l'ability, presenter) vit dans la route Next,
 * qui fournit aussi la server action de suppression — voir
 * DeleteBulkBeneficiairesModalContent pour la raison.
 */
export const MesBeneficiairesListePage = ({
  view,
  liens,
}: {
  view: VueDeMesBeneficiaires
  liens: LiensDeLaListe
}) => {
  // Aucun bénéficiaire enregistré : ni recherche ni table.
  if (view.tag === 'empty') return <BeneficiairesEmpty />

  return (
    <>
      <BeneficiairesListHeader baseHref={BASE_HREF} />
      {view.tag === 'noResults' ? (
        <BeneficiairesNoResults recherche={view.recherche} />
      ) : (
        <BeneficiairesResults view={view} liens={liens} />
      )}
    </>
  )
}
