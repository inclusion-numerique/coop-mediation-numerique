import { telephoneDisplayString } from '@app/web/libraries/telephone'
import type {
  Contact,
  Presentation,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../../domain/fiche'
import type { ChampCompare } from '../../domain/differences'

export type ValeurAffichee =
  | { readonly _tag: 'Absente' }
  | { readonly _tag: 'Texte'; readonly texte: string }
  | { readonly _tag: 'Liste'; readonly valeurs: readonly string[] }
  | { readonly _tag: 'Horaires'; readonly osm: string }

const ABSENTE = { _tag: 'Absente' } as const

const nonVide = (morceaux: readonly (string | null | undefined)[]): string[] =>
  morceaux.filter(
    (morceau): morceau is string => morceau != null && morceau !== '',
  )

const morceauxDuContact = (contact: Contact): string[] =>
  nonVide([
    contact.telephone == null
      ? null
      : telephoneDisplayString(contact.telephone),
    ...(contact.courriels ?? []),
    ...(contact.site_web ?? []),
  ])

const presentationLisible = (presentation: Presentation): string =>
  nonVide([presentation.resume, presentation.detail]).join(' — ')

const liste = (valeurs: readonly string[]): ValeurAffichee =>
  valeurs.length === 0
    ? ABSENTE
    : valeurs.length === 1 && valeurs[0] != null
      ? { _tag: 'Texte', texte: valeurs[0] }
      : { _tag: 'Liste', valeurs }

const texte = (valeur: string): ValeurAffichee =>
  valeur === '' ? ABSENTE : { _tag: 'Texte', texte: valeur }

const horaires = (valeur: unknown): ValeurAffichee =>
  typeof valeur === 'string' && valeur !== ''
    ? { _tag: 'Horaires', osm: valeur }
    : ABSENTE

const enListe = (valeurs: readonly unknown[]): ValeurAffichee =>
  liste(valeurs.map(String))

const afficheurs: {
  readonly [C in ChampCompare]: (
    valeur: NonNullable<Fiche[C]>,
  ) => ValeurAffichee
} = {
  nom: texte,
  typologies: enListe,
  itinerance: enListe,
  contact: (contact) => liste(morceauxDuContact(contact)),
  horaires,
  ficheAccesLibre: texte,
  priseRdv: texte,
  presentation: (presentation) => texte(presentationLisible(presentation)),
  formationsLabels: enListe,
  services: enListe,
  modalitesAccompagnement: enListe,
  modalitesAcces: enListe,
  fraisACharge: enListe,
  publicsSpecifiquementAdresses: enListe,
  priseEnChargeSpecifique: enListe,
}

export const affichee = <C extends ChampCompare>(
  champ: C,
  valeur: Fiche[C],
): ValeurAffichee => (valeur == null ? ABSENTE : afficheurs[champ](valeur))
