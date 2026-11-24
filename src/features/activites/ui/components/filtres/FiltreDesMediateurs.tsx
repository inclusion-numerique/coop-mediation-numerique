'use client'

import { RechercheEnPopover } from '@/libraries/etat-d-url/filtres/RechercheEnPopover'
import { inject } from '@/libraries/nextjs/injection/client'
import type { SelectOption } from '@/libraries/ui/components/form/utils/options'
import { RECHERCHER_DES_MEDIATEURS_DES_ACTIVITES_KEY } from '../../../action/rechercher-des-mediateurs.key'
import { filtreDesMediateurs } from '../../filtres/activites.filtre'

export const FiltreDesMediateurs = ({
  suggestions,
  choisies,
}: {
  suggestions: readonly SelectOption[]
  choisies: readonly SelectOption[]
}) => (
  <RechercheEnPopover
    titre="Médiateur"
    filtre={filtreDesMediateurs}
    libelle="Rechercher un médiateur"
    placeholder="Nom ou adresse électronique"
    selection={{ singular: 'médiateur', plural: 'médiateurs' }}
    rechercher={({ recherche }) =>
      inject(RECHERCHER_DES_MEDIATEURS_DES_ACTIVITES_KEY)({ recherche })
    }
    choisies={choisies}
    suggestions={suggestions}
    longueurMinimale={2}
  />
)
