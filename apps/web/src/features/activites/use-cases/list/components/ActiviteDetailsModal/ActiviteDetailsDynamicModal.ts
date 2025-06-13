'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import type { ActiviteListItem } from '../../db/activitesQueries'

export type ActiviteDetailsDynamicModalState = {
  activite: ActiviteListItem
}

export const ActiviteDetailsDynamicModal = createDynamicModal({
  id: 'activite-details',
  isOpenedByDefault: false,
  initialState: null as null | ActiviteDetailsDynamicModalState,
})
