import { appendComment } from '@app/web/opening-hours/openingHoursHelpers'
import {
  Adresse,
  ComplementAdresse,
  Courriel,
  FicheAccesLibre,
  Horaires,
  Itinerance,
  Localisation,
  ModaliteAcces,
  Pivot,
  Presentation,
  sansDoublons,
  Telephone,
  telephoneCanonique,
  triee,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  fromTimetableOpeningHours,
  type Schedule,
} from '@gouvfr-anct/timetable-to-osm-opening-hours'

/**
 * Des valeurs brutes traduites en modèles du standard.
 *
 * Ces primitives vivent au niveau de la feature parce que créer un lieu, corriger
 * sa fiche et l'importer depuis la cartographie décrivent les mêmes choses : les
 * dupliquer par ability ferait diverger deux lectures d'une même valeur — l'une
 * accepterait une URL que l'autre refuserait.
 *
 * Les fonctions en `*Saisi` portent en plus ce qu'un formulaire ajoute — une case
 * à cocher qui commande le champ ; les autres prennent la valeur telle quelle et
 * servent les deux entrées.
 *
 * Elles sont pures et ne connaissent que le standard : le vocabulaire Prisma,
 * lui, se traduit dans le transfer.
 */

/** Le séparateur multi-valeurs du schéma national. */
export const SEPARATEUR_LISTE = '|'

export const nonVide = (valeur: string | null | undefined): string | null =>
  valeur != null && valeur.trim() !== '' ? valeur.trim() : null

export const urlSaisie = (valeur: string | null | undefined): Url | null => {
  const texte = nonVide(valeur)

  return texte == null ? null : Url.safe(texte)
}

/**
 * Une fiche d'accessibilité, qui n'est pas n'importe quelle URL : le standard
 * exige qu'elle pointe vers Accès Libre. La règle vient de la coop, qui l'a
 * toujours imposée à la saisie ; elle vaut désormais sur tous les chemins
 * d'écriture, imports cartographiques compris.
 */
export const ficheAccesLibreSaisie = (
  valeur: string | null | undefined,
): FicheAccesLibre | null => {
  const texte = nonVide(valeur)

  return texte == null ? null : FicheAccesLibre.safe(texte)
}

export const sitesWebSaisis = (
  valeur: string | null | undefined,
): readonly Url[] =>
  (nonVide(valeur) ?? '')
    .split(SEPARATEUR_LISTE)
    .map((jeton) => Url.safe(jeton.trim()))
    .filter((url): url is Url => url != null)

/**
 * L'immatriculation du lieu : un SIRET, ou rien.
 *
 * Le RNA n'en est plus une. Le standard a ramené `Pivot` au seul SIRET, cinq
 * lieux du jeu national en portant un et aucun ne s'y saisissant ; la colonne
 * `rna` de la coop demeure, mais plus rien ne la lit pour désigner le lieu.
 */
export const pivotSaisi = (siret: string | null | undefined): Pivot | null => {
  const siretSaisi = nonVide(siret)

  return siretSaisi == null ? null : Pivot.safe(siretSaisi)
}

export const presentationSaisie = (
  resume: string | null | undefined,
  detail: string | null | undefined,
): Presentation | null => {
  const resumeSaisi = nonVide(resume)
  const detailSaisi = nonVide(detail)

  if (resumeSaisi == null && detailSaisi == null) return null

  return Presentation.safe({
    ...(resumeSaisi == null ? {} : { resume: resumeSaisi }),
    ...(detailSaisi == null ? {} : { detail: detailSaisi }),
  })
}

/**
 * Le numéro, normalisé puis validé — `null` s'il ne l'est pas.
 *
 * La normalisation accepte ce qu'un humain tape : national, international,
 * séparateurs quelconques. Elle rend l'E.164, seule forme sous laquelle deux
 * écritures d'un même numéro se reconnaissent, et donne aux DOM leur indicatif
 * propre (`0262…` devient `+262262…`, non `+33262…`).
 *
 * La validation, elle, reste celle du schéma national : un lieu paraît sur la
 * cartographie, et le standard n'y admet que les indicatifs français. Un numéro
 * étranger, fût-il parfaitement valide, n'y a pas sa place.
 *
 * `Contact` du standard lève sur un téléphone invalide : la cartographie agrège
 * des producteurs hétérogènes, et une valeur mal formée doit se perdre plutôt
 * que d'interrompre un import.
 */
export const telephoneValide = (
  numero: string | null | undefined,
): Telephone | null => {
  const saisi = nonVide(numero)
  const normalise = saisi == null ? null : telephoneCanonique(saisi)

  return normalise == null ? null : Telephone.safe(normalise)
}

/**
 * Ce que rend une case à cocher isolée : `true` cochée, `null` (ou rien)
 * décochée. Les fonctions qui la lisent la traitent en valeur véridique, ce qui
 * range les trois cas sans distinguer « décochée » de « absente ».
 */
export type Coche = boolean | null | undefined

export const telephoneSaisi = (
  coche: Coche,
  numero: string | null | undefined,
): Telephone | null => (coche ? telephoneValide(numero) : null)

/**
 * Les labels libres, tels que le standard range toute valeur multiple :
 * dédoublonnés et ordonnés. Le champ n'a pas de modèle — il est libre — mais
 * l'ordre d'une liste n'y porte pas davantage d'information qu'ailleurs, et
 * deux exécutions qui ne diffèrent que par lui fabriquent de faux changements.
 */
export const labelsLibres = (
  labels: readonly (string | null | undefined)[],
): string[] =>
  triee(
    sansDoublons(
      labels.map(nonVide).filter((label): label is string => label != null),
    ),
  )

/** Les adresses reconnues parmi celles proposées, dans l'ordre. */
export const courrielsValides = (
  adresses: readonly (string | null | undefined)[],
): readonly Courriel[] =>
  adresses
    .map(nonVide)
    .map((adresse) => (adresse == null ? null : Courriel.safe(adresse)))
    .filter((courriel): courriel is Courriel => courriel != null)

export const courrielsSaisis = (
  coche: Coche,
  adresse: string | null | undefined,
): readonly Courriel[] => (coche ? courrielsValides([adresse]) : [])

/** Les trois seules modalités qu'un formulaire de lieu sait exprimer. */
export const modalitesAccesSaisies = (saisie: {
  surPlace?: Coche
  parTelephone?: Coche
  parMail?: Coche
}): ModaliteAcces[] => [
  ...(saisie.surPlace ? [ModaliteAcces.SePresenter] : []),
  ...(saisie.parTelephone ? [ModaliteAcces.Telephoner] : []),
  ...(saisie.parMail ? [ModaliteAcces.ContacterParMail] : []),
]

export type AdresseSaisie = {
  nom: string
  commune: string
  codePostal: string
  codeInsee: string
  latitude: number
  longitude: number
}

/**
 * Le complément, s'il est reconnu — et rien sinon.
 *
 * Il se valide seul parce qu'il est facultatif : mêlé au reste, un complément
 * refusé emporterait l'adresse entière (D21, D29.1). Le cas n'existait pas
 * avant que le standard ne se mette à le valider ; il vaut désormais pour
 * `Appt #4` comme pour des guillemets droits.
 */
export const complementAdresseSaisi = (
  complement: string | null | undefined,
): ComplementAdresse | null => {
  const texte = nonVide(complement)

  return texte == null ? null : ComplementAdresse.safe(texte)
}

export const adresseSaisie = (
  ban: AdresseSaisie,
  complement: string | null | undefined,
): Adresse | null => {
  const complementSaisi = complementAdresseSaisi(complement)
  const candidate = {
    voie: ban.nom,
    commune: ban.commune,
    code_postal: ban.codePostal,
    code_insee: ban.codeInsee,
    ...(complementSaisi == null ? {} : { complement_adresse: complementSaisi }),
  }

  return Adresse.safe(candidate)
}

export const localisationSaisie = (ban: AdresseSaisie): Localisation | null => {
  const candidate = { latitude: ban.latitude, longitude: ban.longitude }

  return Localisation.safe(candidate)
}

/**
 * L'itinérance se saisit en tri-état : coché, décoché, ou pas renseigné. Le
 * standard, lui, la porte en liste.
 */
export const itineranceSaisie = (
  itinerant: boolean | null | undefined,
): Itinerance[] =>
  itinerant == null
    ? []
    : itinerant
      ? [Itinerance.Itinerant]
      : [Itinerance.Fixe]

/**
 * Les horaires : une grille hebdomadaire à la saisie, une chaîne au format
 * OpenStreetMap dans le standard, et le commentaire libre à la suite.
 *
 * La composition vit ici parce que les deux formulaires saisissent la même
 * grille. Elle a longtemps été faite deux fois sur le chemin de la création —
 * une fois en projetant la saisie, une fois dans le mapper — et `appendComment`
 * ajoutant plutôt que remplaçant, le commentaire s'écrivait en double.
 */
export const horairesSaisis = (
  grille: Schedule,
  commentaire: string | null | undefined,
): Horaires | null => {
  const osm = nonVide(fromTimetableOpeningHours(grille))

  return osm == null
    ? null
    : Horaires.safe(appendComment(osm, nonVide(commentaire)))
}

/** Un horaire tel qu'une source l'a écrit : retenu s'il suit le format OSM. */
export const horairesDeLaSource = (
  horaires: string | null | undefined,
): Horaires | null => {
  const texte = nonVide(horaires)

  return texte == null ? null : Horaires.safe(texte)
}
