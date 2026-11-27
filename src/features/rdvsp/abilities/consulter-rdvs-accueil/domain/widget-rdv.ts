import type { CompteRdv, CompteRdvLie } from '../../../domain/compte/compte-rdv'
import type { DonneesAccueilRdv } from './donnees-accueil-rdv'

export type WidgetRdvAccueil =
  | { readonly _tag: 'masque' }
  | { readonly _tag: 'alerte' }
  | { readonly _tag: 'donnees'; readonly donnees: DonneesAccueilRdv }

export const widgetSansDonnees = (
  compte: Exclude<CompteRdv, CompteRdvLie> | null,
): WidgetRdvAccueil =>
  compte === null || compte._tag === 'deconnecte'
    ? { _tag: 'masque' }
    : { _tag: 'alerte' }

export const synchroniserAuChargement = (compte: CompteRdv): boolean =>
  compte.organisationIdsSansWebhook.length > 0
