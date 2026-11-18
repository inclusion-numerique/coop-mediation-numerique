import { importerBeneficiairesAction } from '@/app/_actions/beneficiaire/importer-beneficiaires.action'
import { ImporterBeneficiairesAnalysePage } from '@/features/beneficiaire/abilities/importer-beneficiaires/ui/pages/ImporterBeneficiairesAnalysePage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const AnalysePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  return (
    <ImporterBeneficiairesAnalysePage
      analysisId={id}
      importer={importerBeneficiairesAction}
    />
  )
}

export default AnalysePage
