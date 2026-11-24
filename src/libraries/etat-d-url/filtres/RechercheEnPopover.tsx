'use client'

import type { ComponentProps } from 'react'
import { FiltresEnPopover } from './FiltresEnPopover'
import { RechercheEnLigne } from './RechercheEnLigne'

export const RechercheEnPopover = ({
  titre,
  ...champ
}: { titre: string } & ComponentProps<typeof RechercheEnLigne>) => (
  <FiltresEnPopover titre={titre} filtres={[champ.filtre]} largeur={384}>
    <RechercheEnLigne {...champ} />
  </FiltresEnPopover>
)
