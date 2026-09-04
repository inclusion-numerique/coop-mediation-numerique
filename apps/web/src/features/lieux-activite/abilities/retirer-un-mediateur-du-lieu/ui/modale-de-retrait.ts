import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'

export type EtatDeLaModaleDeRetrait = {
  mediateurId: string
  structureId: string
  mediateurDisplayName: string
  structureNom: string
  derniereActiviteDate: Date | null
  variant: 'mediateur' | 'lieu'
}

export const ModaleDeRetraitDynamique =
  createDynamicModal<EtatDeLaModaleDeRetrait>({
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
