import type { Rdv } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getRdvs'
import type { ActiviteListItem } from './db/activitesQueries'

export const mergeRdvsWithActivites = ({
  rdvs,
  activites,
}: {
  rdvs: Rdv[]
  activites: ActiviteListItem[]
}): {
  rdvsWithoutActivite: Rdv[]
  activitesWithRdv: ActiviteListItem[]
} => {
  // When activites and rdvs are grouped, we do not display the Rdvs that have been "transformed" into an activite
  const activiteRdvIds = new Map<number, ActiviteListItem>(
    activites
      .map((activite) => [activite.rdvServicePublicId, activite] as const)
      .filter((entry): entry is [number, ActiviteListItem] => !!entry[0]),
  )
  const rdvById = new Map<number, Rdv>(
    rdvs.map((rdv) => [rdv.id, rdv] as const),
  )

  const rdvsWithoutActivite = rdvs.filter((rdv) => !activiteRdvIds.has(rdv.id))

  // Add the rdv to the activite if it exists
  const activitesWithRdv = activites.map((activite) => {
    if (!activite.rdvServicePublicId) {
      return activite
    }
    const rdv = rdvById.get(activite.rdvServicePublicId)
    if (!rdv) {
      return activite
    }
    return {
      ...activite,
      rdv,
    } satisfies ActiviteListItem
  })

  return {
    rdvsWithoutActivite,
    activitesWithRdv,
  }
}
