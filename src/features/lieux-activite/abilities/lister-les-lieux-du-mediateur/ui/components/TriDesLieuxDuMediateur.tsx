'use client'

import { Sort } from '@arckit/resultset'
import { ChoixDuTri } from '@/libraries/etat-d-url/liste'
import { triDesLieux } from '../../../../ui/filtres/tri-des-lieux.filtre'

export const TriDesLieuxDuMediateur = () => (
  <ChoixDuTri
    tri={triDesLieux}
    options={[
      { libelle: 'Nom (A à Z)', tri: Sort('nom', 'asc') },
      { libelle: 'Nom (Z à A)', tri: Sort('nom', 'desc') },
      { libelle: 'MAJ récente', tri: Sort('modification', 'desc') },
      { libelle: 'MAJ ancienne', tri: Sort('modification', 'asc') },
    ]}
  />
)
