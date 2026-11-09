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

export const SEPARATEUR_LISTE = '|'

export const nonVide = (valeur: string | null | undefined): string | null =>
  valeur != null && valeur.trim() !== '' ? valeur.trim() : null

export const urlSaisie = (valeur: string | null | undefined): Url | null => {
  const texte = nonVide(valeur)

  return texte == null ? null : Url.safe(texte)
}

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

export const telephoneValide = (
  numero: string | null | undefined,
): Telephone | null => {
  const saisi = nonVide(numero)
  const normalise = saisi == null ? null : telephoneCanonique(saisi)

  return normalise == null ? null : Telephone.safe(normalise)
}

export type Coche = boolean | null | undefined

export const telephoneSaisi = (
  coche: Coche,
  numero: string | null | undefined,
): Telephone | null => (coche ? telephoneValide(numero) : null)

export const labelsLibres = (
  labels: readonly (string | null | undefined)[],
): string[] =>
  triee(
    sansDoublons(
      labels.map(nonVide).filter((label): label is string => label != null),
    ),
  )

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

export const itineranceSaisie = (
  itinerant: boolean | null | undefined,
): Itinerance[] =>
  itinerant == null
    ? []
    : itinerant
      ? [Itinerance.Itinerant]
      : [Itinerance.Fixe]

export const horairesSaisis = (
  grille: Schedule,
  commentaire: string | null | undefined,
): Horaires | null => {
  const osm = nonVide(fromTimetableOpeningHours(grille))

  return osm == null
    ? null
    : Horaires.safe(appendComment(osm, nonVide(commentaire)))
}

export const horairesDeLaSource = (
  horaires: string | null | undefined,
): Horaires | null => {
  const texte = nonVide(horaires)

  return texte == null ? null : Horaires.safe(texte)
}
