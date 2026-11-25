'use client'

import { RechercheEnPopover } from '@/libraries/etat-d-url/filtres'
import { inject } from '@/libraries/nextjs/injection'
import type { SelectOption } from '@/libraries/ui/form'
import { RECHERCHER_DES_COMMUNES_DU_RESEAU_KEY } from '../../action/rechercher-des-communes-du-reseau.key'
import { filtreDesCommunesDuReseau } from '../filtres/reseau.filtre'

export const FiltreDesCommunesDuReseau = ({
  suggestions,
  choisies,
}: {
  suggestions: readonly SelectOption[]
  choisies: readonly SelectOption[]
}) => (
  <RechercheEnPopover
    titre="Commune"
    filtre={filtreDesCommunesDuReseau}
    libelle="Filtrer par commune"
    placeholder="Nom ou code postal de la commune"
    selection={{
      singular: 'commune sélectionnée',
      plural: 'communes sélectionnées',
    }}
    rechercher={(input) => inject(RECHERCHER_DES_COMMUNES_DU_RESEAU_KEY)(input)}
    choisies={choisies}
    suggestions={suggestions}
    longueurMinimale={2}
  />
)
