'use client'

import { Sort } from '@arckit/resultset'
import { ChoixDuTri } from '@/libraries/etat-d-url/liste'
import { triDesTags } from '../filtres/liste-des-tags.filtre'

export const TriDesTags = () => (
  <ChoixDuTri
    tri={triDesTags}
    options={[
      { libelle: 'Ordre alphabétique', tri: Sort('nom', 'asc') },
      { libelle: 'Visibilité', tri: Sort('visibilite', 'asc') },
    ]}
  />
)
