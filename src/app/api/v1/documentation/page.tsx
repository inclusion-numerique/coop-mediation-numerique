import type { Metadata } from 'next'
import { DocumentationDeLApiPage } from '@/features/clients-api/ui/pages/DocumentationDeLApiPage'

export const metadata: Metadata = {
  title: 'La coop - API',
}

const DocumentationPage = () => (
  <DocumentationDeLApiPage specification="/api/v1/openapi" />
)

export default DocumentationPage
