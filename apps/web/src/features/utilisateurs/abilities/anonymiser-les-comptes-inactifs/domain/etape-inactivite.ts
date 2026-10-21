import type { Jalon } from '@app/web/features/utilisateurs/domain'
import { addDays, addYears, isBefore, max, subDays } from 'date-fns'

export const ANNEES_AVANT_SUPPRESSION = 2

export const JOURS_DE_PREAVIS = 30

export type EtapeInactivite =
  | { readonly _tag: 'actif' }
  | { readonly _tag: 'aAvertir'; readonly dateDeSuppression: Date }
  | { readonly _tag: 'enAttente'; readonly dateDeSuppression: Date }
  | { readonly _tag: 'aSupprimer' }

export const etapeInactivite = ({
  derniereActivite,
  avertiLe,
  maintenant,
}: {
  readonly derniereActivite: Date
  readonly avertiLe: Jalon
  readonly maintenant: Date
}): EtapeInactivite => {
  const echeance = addYears(derniereActivite, ANNEES_AVANT_SUPPRESSION)

  if (isBefore(maintenant, subDays(echeance, JOURS_DE_PREAVIS))) {
    return { _tag: 'actif' }
  }

  if (avertiLe._tag === 'Jamais' || isBefore(avertiLe.date, derniereActivite)) {
    return {
      _tag: 'aAvertir',
      dateDeSuppression: max([echeance, addDays(maintenant, JOURS_DE_PREAVIS)]),
    }
  }

  const dateDeSuppression = max([
    echeance,
    addDays(avertiLe.date, JOURS_DE_PREAVIS),
  ])

  return isBefore(maintenant, dateDeSuppression)
    ? { _tag: 'enAttente', dateDeSuppression }
    : { _tag: 'aSupprimer' }
}
