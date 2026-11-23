import type { Metadata } from 'next'
import { DocumentationDeLApi } from '@/features/clients-api/abilities/consulter-la-documentation-de-l-api/ui/pages/DocumentationDeLApi'

export const metadata: Metadata = {
  title: 'La coop - API',
}

const DocumentationPage = () => (
  <DocumentationDeLApi specification="/api/v1/openapi" />
)

export default DocumentationPage
