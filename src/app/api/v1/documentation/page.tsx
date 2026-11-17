import { DocumentationDeLApi } from '@app/web/features/clients-api/ui/DocumentationDeLApi'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'La coop - API',
}

const DocumentationPage = () => (
  <DocumentationDeLApi specification="/api/v1/openapi" />
)

export default DocumentationPage
