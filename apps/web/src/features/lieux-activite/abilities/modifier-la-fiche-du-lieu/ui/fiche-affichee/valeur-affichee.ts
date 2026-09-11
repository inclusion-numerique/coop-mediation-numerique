import { telephoneDisplayString } from '@app/web/libraries/telephone'
import type {
  Adresse,
  Contact,
  Presentation,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
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

const adresseLisible = (adresse: Adresse): string =>
  nonVide([
    adresse.voie,
    adresse.complement_adresse,
    `${adresse.code_postal} ${adresse.commune}`,
  ]).join(', ')

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

export const affichee = (
  champ: ChampCompare,
  valeur: unknown,
): ValeurAffichee => {
  if (valeur == null) return ABSENTE

  if (champ === 'horaires') return horaires(valeur)

  if (typeof valeur === 'string') return texte(valeur)
  if (Array.isArray(valeur)) return liste(valeur.map(String))
  if (typeof valeur !== 'object') return texte(String(valeur))

  if ('voie' in valeur) return texte(adresseLisible(valeur as Adresse))

  if ('resume' in valeur || 'detail' in valeur)
    return texte(presentationLisible(valeur as Presentation))

  return liste(morceauxDuContact(valeur as Contact))
}
