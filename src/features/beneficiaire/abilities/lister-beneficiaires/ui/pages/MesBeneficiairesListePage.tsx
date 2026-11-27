import { BeneficiairesEmpty } from '../components/BeneficiairesEmpty'
import { BeneficiairesListHeader } from '../components/BeneficiairesListHeader'
import { BeneficiairesNoResults } from '../components/BeneficiairesNoResults'
import { BeneficiairesResults } from '../components/BeneficiairesResults'
import type { LiensDeLaListe } from '../filtres/liste-des-beneficiaires.filtre'
import type { VueDeMesBeneficiaires } from '../presenters/lister-beneficiaires.presenter'

const BASE_HREF = '/coop/mes-beneficiaires'

export const MesBeneficiairesListePage = ({
  view,
  liens,
}: {
  view: VueDeMesBeneficiaires
  liens: LiensDeLaListe
}) => {
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
