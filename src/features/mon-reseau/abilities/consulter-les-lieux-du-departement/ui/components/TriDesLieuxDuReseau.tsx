'use client'

import { Sort } from '@arckit/resultset'
import { ChoixDuTri } from '@/libraries/etat-d-url/liste/ChoixDuTri'
import { triDesLieuxDuReseau } from '../filtres/lieux-du-reseau.filtre'

export const TriDesLieuxDuReseau = () => (
  <ChoixDuTri
    tri={triDesLieuxDuReseau}
    options={[
      { libelle: 'Alphabétique (A à Z)', tri: Sort('nom', 'asc') },
      { libelle: 'Alphabétique (Z à A)', tri: Sort('nom', 'desc') },
      { libelle: 'Mise à jour récente', tri: Sort('modification', 'desc') },
      { libelle: 'Mise à jour ancienne', tri: Sort('modification', 'asc') },
    ]}
  />
)
