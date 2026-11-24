import type { ReactNode } from 'react'

export const PubliqueLayout = ({
  entete,
  piedDePage,
  children,
}: {
  entete: ReactNode
  piedDePage: ReactNode
  children: ReactNode
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <div id="skip-links" />
    {entete}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
    {piedDePage}
  </div>
)
