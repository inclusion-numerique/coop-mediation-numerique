'use client'

import '@scalar/api-reference-react/style.css'
import dynamic from 'next/dynamic'

const ApiReferenceReact = dynamic(
  () =>
    import('@scalar/api-reference-react').then(
      ({ ApiReferenceReact }) => ApiReferenceReact,
    ),
  { ssr: false },
)

export const DocumentationDeLApiPage = ({
  specification,
}: {
  specification: string
}) => (
  <ApiReferenceReact
    configuration={{
      url: specification,
      withDefaultFonts: false,
      agent: { disabled: true },
    }}
  />
)
