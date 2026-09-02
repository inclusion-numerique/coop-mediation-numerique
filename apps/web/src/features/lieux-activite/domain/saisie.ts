import { fixTelephone } from '@app/web/utils/clean-operations'
import {
  Adresse,
  Courriel,
  Itinerance,
  isRna,
  isSiret,
  isValidAddress,
  isValidCourriel,
  isValidLocalisation,
  isValidTelephone,
  isValidUrl,
  Localisation,
  ModaliteAcces,
  type Pivot,
  type Presentation,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

/**
 * Ce qu'un formulaire de lieu produit, traduit en modèles du standard.
 *
 * Ces primitives vivent au niveau de la feature parce que créer un lieu et
 * corriger sa fiche saisissent les mêmes choses : les dupliquer par ability
 * ferait diverger deux lectures d'un même formulaire — l'une accepterait une
 * URL que l'autre refuserait.
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

  return texte != null && isValidUrl(texte) ? Url(texte) : null
}

export const sitesWebSaisis = (
  valeur: string | null | undefined,
): readonly Url[] =>
  (nonVide(valeur) ?? '')
    .split(SEPARATEUR_LISTE)
    .map((jeton) => jeton.trim())
    .filter(isValidUrl)
    .map(Url)

export const pivotSaisi = (
  siret: string | null | undefined,
  rna: string | null | undefined,
): Pivot | null => {
  const siretSaisi = nonVide(siret)
  if (siretSaisi != null && isSiret(siretSaisi)) return siretSaisi

  const rnaSaisi = nonVide(rna)

  return rnaSaisi != null && isRna(rnaSaisi) ? rnaSaisi : null
}

export const presentationSaisie = (
  resume: string | null | undefined,
  detail: string | null | undefined,
): Presentation | null => {
  const resumeSaisi = nonVide(resume)
  const detailSaisi = nonVide(detail)

  if (resumeSaisi == null && detailSaisi == null) return null

  return {
    ...(resumeSaisi == null ? {} : { resume: resumeSaisi }),
    ...(detailSaisi == null ? {} : { detail: detailSaisi }),
  }
}

export const telephoneSaisi = (
  coche: boolean,
  numero: string | null | undefined,
): string | null => {
  if (!coche) return null

  const saisi = nonVide(numero)
  const normalise = saisi == null ? null : fixTelephone(saisi)

  return normalise != null && isValidTelephone(normalise) ? normalise : null
}

export const courrielsSaisis = (
  coche: boolean,
  adresse: string | null | undefined,
): readonly Courriel[] => {
  const saisie = coche ? nonVide(adresse) : null

  return saisie != null && isValidCourriel(saisie) ? [Courriel(saisie)] : []
}

/** Les trois seules modalités qu'un formulaire de lieu sait exprimer. */
export const modalitesAccesSaisies = (saisie: {
  surPlace: boolean
  parTelephone: boolean
  parMail: boolean
}): readonly ModaliteAcces[] => [
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

export const adresseSaisie = (
  ban: AdresseSaisie,
  complement: string | null | undefined,
): Adresse | null => {
  const complementSaisi = nonVide(complement)
  const candidate = {
    voie: ban.nom,
    commune: ban.commune,
    code_postal: ban.codePostal,
    code_insee: ban.codeInsee,
    ...(complementSaisi == null ? {} : { complement_adresse: complementSaisi }),
  }

  return isValidAddress(candidate) ? Adresse(candidate) : null
}

export const localisationSaisie = (ban: AdresseSaisie): Localisation | null => {
  const candidate = { latitude: ban.latitude, longitude: ban.longitude }

  return isValidLocalisation(candidate) ? Localisation(candidate) : null
}

/**
 * L'itinérance se saisit en tri-état : coché, décoché, ou pas renseigné. Le
 * standard, lui, la porte en liste.
 */
export const itineranceSaisie = (
  itinerant: boolean | null | undefined,
): readonly Itinerance[] =>
  itinerant == null
    ? []
    : itinerant
      ? [Itinerance.Itinerant]
      : [Itinerance.Fixe]
