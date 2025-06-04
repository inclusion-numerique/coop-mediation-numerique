import { ComponentProps } from 'react'

export const Label = ({ children }: ComponentProps<'label'>) => (
  <span className="fr-label fr-text--medium fr-mb-3v">{children}</span>
)
