'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import type { ActiviteListItemWithTimezone } from '@app/web/features/activites/use-cases/list/db/activitesQueries'

export type ActiviteDetailsDynamicModalState = {
  activite: ActiviteListItemWithTimezone
}

export const ActiviteDetailsDynamicModal = createDynamicModal({
  id: 'activite-details',
  isOpenedByDefault: false,
  initialState: null as null | ActiviteDetailsDynamicModalState,
})
