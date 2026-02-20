'use client'

import CustomSelectFormField from '@app/ui/components/Form/CustomSelectFormField'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import type { SearchStructureResultStructure } from '@app/web/structure/searchStructure'
import { trpc } from '@app/web/trpc'
import { ReactElement, useRef } from 'react'
import { useForm } from 'react-hook-form'

const toLabel = ({
  nom,
  adresse,
  commune,
  codePostal,
}: {
  nom: string
  adresse: string
  commune: string
  codePostal: string
}) => (
  <>
    <div className="fr-width-full fr-text--sm fr-mb-0">{nom}</div>
    <div className="fr-width-full fr-text--xs fr-text-mention--grey fr-mb-0">
      {adresse}, {codePostal} {commune}
    </div>
  </>
)

const SearchSingleStructure = ({
  excludeStructureIds = [],
  defaultStructure,
  onSelect,
}: {
  excludeStructureIds?: string[]
  defaultStructure?: {
    id: string
    nom: string
    adresse: string
    commune: string
    codePostal: string
  }
  onSelect?: (option: { label: ReactElement; value: string }) => void
}) => {
  const form = useForm<{ structure: string }>()

  const { client: trpcClient } = trpc.useContext()

  const structuresMapRef = useRef(
    new Map<string, SearchStructureResultStructure>(),
  )

  const loadOptions = async (search: string) => {
    const result = await trpcClient.structures.search.query({ query: search })

    const filteredStructures = result.structures.filter(
      (s) => !excludeStructureIds.includes(s.id),
    )

    for (const structure of filteredStructures) {
      structuresMapRef.current.set(structure.id, structure)
    }

    const hasMore = result.matchesCount - result.structures.length
    const hasMoreMessage = hasMore
      ? hasMore === 1
        ? `Veuillez préciser votre recherche - 1 structure n'est pas affichée`
        : `Veuillez préciser votre recherche - ${hasMore} structures ne sont pas affichées`
      : null

    return [
      {
        label: `${filteredStructures.length} résultat${sPluriel(filteredStructures.length)}`,
        value: '',
      },
      ...filteredStructures.map((structure) => ({
        label: toLabel(structure),
        value: structure.id,
      })),
      ...(hasMoreMessage
        ? [
            {
              label: hasMoreMessage,
              value: '',
            },
          ]
        : []),
    ] as {
      label: ReactElement
      value: string
    }[]
  }

  return (
    <CustomSelectFormField
      label={null}
      control={form.control}
      path="structure"
      placeholder="Rechercher une structure..."
      loadOptions={loadOptions}
      defaultValue={
        defaultStructure == null
          ? undefined
          : { label: toLabel(defaultStructure), value: defaultStructure.id }
      }
      isOptionDisabled={(option) => option.value === ''}
      onChange={(option) => {
        if (option == null || option.value === '') return
        onSelect?.(option)
      }}
    />
  )
}

export default withTrpc(SearchSingleStructure)
