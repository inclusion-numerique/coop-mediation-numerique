'use client'

import { API } from '@stoplight/elements'
import { noSsr } from '@app/web/components/NoSsr'

const ApiDocsPageContent = () => (
  <API apiDescriptionUrl="/api/v1/openapi" layout="sidebar" router="hash" />
)

// Stoplight is not compatible with ssr (router="hash" etc.)
export default noSsr(ApiDocsPageContent)