'use client'

import type { ComponentProps } from 'react'
import { ChoixEnLigne } from './ChoixEnLigne'
import { FiltresEnPopover } from './FiltresEnPopover'

type Section = ComponentProps<typeof ChoixEnLigne>

export const ChoixEnPopover = ({
  titre,
  sections,
}: {
  titre: string
  sections: readonly Section[]
}) => (
  <FiltresEnPopover
    titre={titre}
    largeur={384}
    filtres={sections.map(({ filtre }) => filtre)}
  >
    {sections.map((section, rang) => (
      <div
        key={section.filtre.cle}
        className={rang > 0 ? 'fr-mt-6v' : undefined}
      >
        <ChoixEnLigne {...section} />
      </div>
    ))}
  </FiltresEnPopover>
)
