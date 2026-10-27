import {
  type ActiviteListItemWithTimezone,
  activiteListSelect,
} from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { addTimezoneToActivite } from '@app/web/features/activites/use-cases/list/db/addTimezoneToActivite'
import { addRdvBadgeStatus } from '@app/web/features/rdvsp/db/badge-statut-rdv'
import { prismaClient } from '@app/web/prismaClient'
import type { MediateurId } from '../../domain'

const NOMBRE_DE_DERNIERES_ACTIVITES = 3

export const listerLesDernieresActivites = async ({
  mediateurId,
  timezone,
}: {
  mediateurId: MediateurId
  timezone: string
}): Promise<ActiviteListItemWithTimezone[]> =>
  (
    await prismaClient.activite.findMany({
      where: { mediateurId, suppression: null },
      select: activiteListSelect,
      orderBy: { creation: 'desc' },
      take: NOMBRE_DE_DERNIERES_ACTIVITES,
    })
  )
    .map(addTimezoneToActivite({ timezone }))
    .map((activite) => ({
      ...activite,
      rdv: activite.rdv ? addRdvBadgeStatus(activite.rdv) : null,
    }))
