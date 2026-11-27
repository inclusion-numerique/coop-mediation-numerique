'use client'

import { useRouter } from 'next/navigation'
import { hrefDuLieuAFusionner } from '@/features/lieux-activite/ui/presenters/href-du-lieu.presenter'
import RechercheDUnLieu from '../components/RechercheDUnLieu'

export const ChoisirLeLieuAFusionner = ({
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

  const allerVersLApercu = ({ id }: { id: string }) => {
    router.push(hrefDuLieuAFusionner(structureId, id))
  }

  return (
    <div className="fr-border-radius--8 fr-border fr-p-8v fr-mb-6v">
      <h2 className="fr-h6">Rechercher la structure avec laquelle fusionner</h2>
      <RechercheDUnLieu
        onSelect={allerVersLApercu}
        defaultStructure={defaultMergeStructure}
        excludeStructureIds={[structureId]}
      />
    </div>
  )
}
