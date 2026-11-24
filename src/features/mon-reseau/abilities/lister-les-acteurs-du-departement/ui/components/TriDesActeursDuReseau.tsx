'use client'

import { Sort } from '@arckit/resultset'
import { ChoixDuTri } from '@/libraries/etat-d-url/liste/ChoixDuTri'
import { triDesActeursDuReseau } from '../filtres/acteurs-du-reseau.filtre'

export const TriDesActeursDuReseau = () => (
  <ChoixDuTri
    tri={triDesActeursDuReseau}
    options={[
      { libelle: 'Nom (A à Z)', tri: Sort('nom', 'asc') },
      { libelle: 'Nom (Z à A)', tri: Sort('nom', 'desc') },
    ]}
  />
)
