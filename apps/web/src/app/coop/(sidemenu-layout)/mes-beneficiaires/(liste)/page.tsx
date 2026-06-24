import { metadataTitle } from '@app/web/app/metadataTitle'
import type { MesBeneficiairesSearchParams } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/ui/components/lister-beneficiaires-search-params'
import { MesBeneficiairesListePage } from '@app/web/features/beneficiaire/abilities/lister-beneficiaires/ui/pages/MesBeneficiairesListePage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Mes bénéficiaires'),
}

const MesBeneficiairesPage = async (props: {
  searchParams: Promise<MesBeneficiairesSearchParams>
}) => <MesBeneficiairesListePage searchParams={await props.searchParams} />

export default MesBeneficiairesPage
