'use client'

import { ChoixEnPopover } from '@/libraries/etat-d-url/filtres'
import { filtreDuRoleDeLActeur } from '../filtres/acteurs-du-reseau.filtre'

export const FiltreDuRoleDeLActeur = () => (
  <ChoixEnPopover
    titre="Rôle"
    sections={[
      { filtre: filtreDuRoleDeLActeur, legende: 'Filtrer par rôle :' },
    ]}
  />
)
