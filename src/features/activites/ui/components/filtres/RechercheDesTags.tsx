'use client'

import { RechercheEnLigne } from '@/libraries/etat-d-url/filtres/RechercheEnLigne'
import { inject } from '@/libraries/nextjs/injection/client'
import type { SelectOption } from '@/libraries/ui/form/utils/options'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '../../../action/rechercher-des-tags.key'
import { filtreDesTags } from '../../filtres/activites.filtre'

const rechercherDesTags = async ({ recherche }: { recherche: string }) => {
  const resultat = await inject(RECHERCHER_DES_TAGS_DU_CRA_KEY)({ recherche })
  return resultat.success
    ? {
        success: true as const,
        data: resultat.data.map(({ id, nom }) => ({ value: id, label: nom })),
      }
    : resultat
}

export const RechercheDesTags = ({
  suggestions,
  choisies,
}: {
  suggestions: readonly SelectOption[]
  choisies: readonly SelectOption[]
}) => (
  <RechercheEnLigne
    filtre={filtreDesTags}
    libelle="Filtrer par tags"
    placeholder="Rechercher un tag"
    selection={{ singular: 'tag', plural: 'tags' }}
    rechercher={rechercherDesTags}
    choisies={choisies}
    suggestions={suggestions}
  />
)
