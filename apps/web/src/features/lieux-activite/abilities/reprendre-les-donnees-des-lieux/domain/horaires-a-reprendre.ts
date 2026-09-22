import {
  appliquerRegles,
  DETAIL_LONGUEUR_MAXIMALE,
  Horaires,
  type RegleDeNettoyage,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { type LieuAReprendre, nonVide } from './lieu-a-reprendre'

const JOUR = 'Mo|Tu|We|Th|Fr|Sa|Su|PH'
const PLAGE = '(?:[01]\\d|2[0-3]):[0-5]\\d-(?:[01]\\d|2[0-3]):[0-5]\\d'
const JOURS = `(?:${JOUR})(?:[-,](?:${JOUR}))*`
const PLAGES = `(?:${PLAGE}(?:,${PLAGE})*|off)`

const REGLE_SEULE = new RegExp(`^${JOURS}\\s+${PLAGES}$`, 'u')
const REGLE_SUIVIE_DE_TEXTE = new RegExp(
  `^(?<regle>${JOURS}\\s+${PLAGES})\\s+(?<texte>.+)$`,
  'u',
)
const COMMENTAIRE_FINAL = /^(?<corps>.*?)\s*"(?<commentaire>[^"]*)"\s*$/u

const FERMETURE_DITE_CLOSED: RegleDeNettoyage = {
  nom: 'fermeture écrite « closed » là où le format attend « off »',
  selecteur: /\bclosed\b/u,
  corriger: (aCorriger) => aCorriger.replaceAll(/\bclosed\b/gu, 'off'),
}

const DEUX_POINTS_APRES_LE_JOUR: RegleDeNettoyage = {
  nom: 'deux-points entre le jour et ses plages',
  selecteur: new RegExp(`(?:${JOUR})\\s*:`, 'u'),
  corriger: (aCorriger) =>
    aCorriger.replaceAll(new RegExp(`(${JOUR})\\s*:`, 'gu'), '$1'),
}

const ESPACE_AVANT_LA_VIRGULE: RegleDeNettoyage = {
  nom: 'espace avant la virgule qui sépare deux plages',
  selecteur: /\s+,/u,
  corriger: (aCorriger) => aCorriger.replaceAll(/\s+,/gu, ','),
}

const REGLES_DE_NETTOYAGE: readonly RegleDeNettoyage[] = [
  FERMETURE_DITE_CLOSED,
  DEUX_POINTS_APRES_LE_JOUR,
  ESPACE_AVANT_LA_VIRGULE,
]

type Decoupe = {
  readonly regles: readonly string[]
  readonly horsRegles: readonly string[]
}

const RIEN_DE_DECOUPE: Decoupe = { regles: [], horsRegles: [] }

const ajouterLeSegment = (decoupe: Decoupe, segment: string): Decoupe => {
  if (segment === '') return decoupe

  if (decoupe.horsRegles.length > 0)
    return { ...decoupe, horsRegles: [...decoupe.horsRegles, segment] }

  if (REGLE_SEULE.test(segment))
    return { ...decoupe, regles: [...decoupe.regles, segment] }

  const melange = REGLE_SUIVIE_DE_TEXTE.exec(segment)?.groups

  return melange == null
    ? { ...decoupe, horsRegles: [segment] }
    : {
        regles: [...decoupe.regles, melange.regle ?? ''],
        horsRegles: [melange.texte ?? ''],
      }
}

const detacherLeCommentaire = (
  valeur: string,
): { readonly corps: string; readonly commentaire: string } => {
  const trouve = COMMENTAIRE_FINAL.exec(valeur)?.groups

  return {
    corps: trouve?.corps ?? valeur,
    commentaire: trouve?.commentaire ?? '',
  }
}

const enUnSeulCommentaire = (textes: readonly string[]): string =>
  textes
    .filter((texte) => texte.trim() !== '')
    .join(' ')
    .replaceAll('"', "'")
    .trim()

const recomposer = (
  { regles, horsRegles }: Decoupe,
  commentaire: string,
): string | null => {
  if (regles.length === 0) return null

  const note = enUnSeulCommentaire([...horsRegles, commentaire])

  return note === '' ? regles.join('; ') : `${regles.join('; ')} "${note}"`
}

export const horairesNormalises = (valeur: string): Horaires | null => {
  const propres = appliquerRegles(REGLES_DE_NETTOYAGE, valeur.trim())
  const { corps, commentaire } = detacherLeCommentaire(propres)
  const recomposes = recomposer(
    corps
      .split(';')
      .map((segment) => segment.trim())
      .reduce(ajouterLeSegment, RIEN_DE_DECOUPE),
    commentaire,
  )

  return recomposes == null ? null : Horaires.safe(recomposes)
}

export type HorairesAReprendre =
  | { readonly verdict: 'a-corriger'; readonly corriges: Horaires }
  | {
      readonly verdict: 'a-deplacer'
      readonly valeur: string
      readonly note: string
    }

const noteDe = (valeur: string): string => {
  const { corps, commentaire } = detacherLeCommentaire(valeur)

  return enUnSeulCommentaire([corps, commentaire])
}

export const horairesAReprendre = (
  lieu: LieuAReprendre,
): HorairesAReprendre | null => {
  const valeur = nonVide(lieu.horaires)

  if (valeur == null) return null

  const normalises = horairesNormalises(valeur)

  if (normalises == null)
    return Horaires.safe(valeur) == null
      ? { verdict: 'a-deplacer', valeur, note: noteDe(valeur) }
      : null

  return normalises === valeur
    ? null
    : { verdict: 'a-corriger', corriges: normalises }
}

export const descriptionAvecLaNote = (
  description: string | null,
  note: string,
): string | null => {
  const existante = nonVide(description)

  if (existante == null)
    return note.length <= DETAIL_LONGUEUR_MAXIMALE ? note : null

  if (existante.includes(note)) return existante

  const augmentee = `${existante}\n\n${note}`

  return augmentee.length <= DETAIL_LONGUEUR_MAXIMALE ? augmentee : null
}
