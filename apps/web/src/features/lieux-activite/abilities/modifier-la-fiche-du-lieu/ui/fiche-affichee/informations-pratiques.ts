import { safeToTimetableOpeningHours } from '@app/web/opening-hours/openingHoursHelpers'
import {
  CLOSED_SCHEDULE,
  type Schedule,
} from '@gouvfr-anct/timetable-to-osm-opening-hours'
import type { Fiche } from '../../../../domain/fiche'
import { aucuneValeur } from './section-vide'

export type InformationsPratiquesAffichees = {
  readonly siteWeb: string | null
  readonly sitesWeb: readonly string[]
  readonly ficheAccesLibre: string | null
  readonly priseRdv: string | null
  readonly horaires: string | null
  readonly openingHours: Schedule
  readonly horairesComment: string | null
  readonly estVide: boolean
}

const SEPARATEUR_LISTE = '|'

const commentaireDesHoraires = (horaires: string | null): string | null =>
  horaires?.match(/".+"/g)?.toString().replaceAll('"', '') ?? null

const horairesOuvertes = (horaires: string | null): Schedule =>
  horaires == null
    ? CLOSED_SCHEDULE
    : safeToTimetableOpeningHours(new Date())(horaires)

export const informationsPratiques = (
  fiche: Fiche,
): InformationsPratiquesAffichees => {
  const sitesWeb = fiche.contact.site_web ?? []

  return {
    siteWeb: sitesWeb.length === 0 ? null : sitesWeb.join(SEPARATEUR_LISTE),
    sitesWeb: [...sitesWeb],
    ficheAccesLibre: fiche.ficheAccesLibre ?? null,
    priseRdv: fiche.priseRdv ?? null,
    horaires: fiche.horaires,
    openingHours: horairesOuvertes(fiche.horaires),
    horairesComment: commentaireDesHoraires(fiche.horaires),
    estVide: aucuneValeur([
      sitesWeb,
      fiche.ficheAccesLibre,
      fiche.priseRdv,
      fiche.horaires,
    ]),
  }
}
