import type { ReactNode } from 'react'

export const RdvServicePublicLayout = ({
  children,
}: {
  children: ReactNode
}) => (
  <div className="fr-flex fr-direction-column fr-background-alt--blue-ecume fr-height-full">
    <div className="fr-container fr-container--narrow fr-mb-20v">
      {children}
    </div>
  </div>
)
