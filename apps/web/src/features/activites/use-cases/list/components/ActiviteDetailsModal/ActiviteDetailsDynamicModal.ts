'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { ActiviteForList } from '../../db/activitesQueries'

export type ActiviteDetailsDynamicModalState = {
  activite: ActiviteForList
}

export const ActiviteDetailsDynamicModal = createDynamicModal({
  id: 'activite-details',
  isOpenedByDefault: false,
  initialState: null as null | ActiviteDetailsDynamicModalState,
})
