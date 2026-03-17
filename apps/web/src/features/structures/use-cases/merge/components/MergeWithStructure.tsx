'use client'

import { useRouter } from 'next/navigation'
import SearchSingleStructure from './SearchSingleStructure'

export const MergeWithStructure = ({
  structureId,
  defaultMergeStructure,
}: {
  structureId: string
  defaultMergeStructure?: {
    id: string
    nom: string
    adresse: string
    commune: string
    codePostal: string
  }
}) => {
  const router = useRouter()

  const handleSearchStructureSelect = ({ value: id }: { value: string }) => {
    router.push(`/administration/structures/${structureId}/merge/${id}`)
  }

  return (
    <div className="fr-border-radius--8 fr-border fr-p-8v fr-mb-6v">
      <h2 className="fr-h6">Rechercher la structure avec laquelle fusionner</h2>
      <SearchSingleStructure
        onSelect={handleSearchStructureSelect}
        defaultStructure={defaultMergeStructure}
        excludeStructureIds={[structureId]}
      />
    </div>
  )
}
