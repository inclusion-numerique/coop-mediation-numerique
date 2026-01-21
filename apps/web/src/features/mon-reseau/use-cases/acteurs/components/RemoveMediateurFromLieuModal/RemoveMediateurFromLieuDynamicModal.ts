import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'

export type RemoveMediateurFromLieuModalState = {
  mediateurId: string
  structureId: string
  mediateurDisplayName: string
  structureNom: string
  derniereActiviteDate: Date | null
  variant: 'mediateur' | 'lieu'
}

export const RemoveMediateurFromLieuDynamicModal =
  createDynamicModal<RemoveMediateurFromLieuModalState>({
    id: 'remove-mediateur-from-lieu-modal',
    isOpenedByDefault: false,
    initialState: {
      mediateurId: '',
      structureId: '',
      mediateurDisplayName: '',
      structureNom: '',
      derniereActiviteDate: null,
      variant: 'mediateur',
    },
  })
