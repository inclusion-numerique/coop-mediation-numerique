import {
  ABREVIATIONS_DE_TYPE_DE_VOIE,
  nettoyerVoiePourRecherche,
  TYPES_DE_VOIE,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuAReprendre } from '../../../domain'

/** Ce que la Base Adresse Nationale rend d'une adresse qu'on lui soumet. */
export type AdresseGeocodee = {
  readonly type: string
  readonly score: number
  readonly banId: string
  readonly voie: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string
  readonly latitude: number
  readonly longitude: number
  readonly libelle: string
}

/** Ce que la Base Adresse Nationale trouve au point qu'on lui montre. */
export type AdresseRetrouvee = AdresseGeocodee & { readonly distance: number }

export type CoordonneesSoumises = {
  readonly lieuId: string
  readonly latitude: number
  readonly longitude: number
  readonly codeInsee: string | null
}

export type AdresseSoumise = {
  readonly lieuId: string
  readonly voie: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
}

export type AdresseAReprendre =
  | { readonly verdict: 'a-corriger'; readonly adresse: AdresseGeocodee }
  | { readonly verdict: 'a-verifier'; readonly motif: string }

const SCORE_MINIMAL = 0.9

/**
 * Au-delà, le point et l'adresse rendue ne désignent plus le même endroit : une
 * vingtaine de mètres sépare deux entrées d'un même bâtiment, pas deux
 * bâtiments.
 */
const DISTANCE_MAXIMALE = 20

const TYPES_PRECIS: ReadonlySet<string> = new Set(['housenumber', 'street'])

const MOTIFS = {
  sansReponse: 'la Base Adresse Nationale ne rend rien',
  repli: 'la voie est introuvable',
  autreCommune: 'une autre commune que celle enregistrée',
  scoreInsuffisant: 'score insuffisant',
} as const

export const coordonneesSoumises = (
  lieu: LieuAReprendre,
): readonly CoordonneesSoumises[] =>
  lieu.latitude == null || lieu.longitude == null
    ? []
    : [
        {
          lieuId: lieu.id,
          latitude: lieu.latitude,
          longitude: lieu.longitude,
          codeInsee: lieu.codeInsee,
        },
      ]

/**
 * La voie telle qu'on la soumet à la Base Adresse Nationale, et non telle qu'on
 * la garde.
 *
 * Les imports ont écrit devant la voie ce qui n'en fait pas partie — le nom de
 * l'hôtel de ville, la zone d'activité, la boîte postale, le premier numéro
 * d'une fourchette. La bibliothèque sait les ôter pour chercher ; c'est ce que
 * son `nettoyerVoiePourRecherche` fait, et lui seul : l'adresse retenue reste
 * celle que la Base Adresse Nationale rend.
 *
 * Mesuré sur les 12 780 lieux : 108 voies s'en trouvent changées, 76 franchissent
 * alors le seuil d'appariement, aucune ne le perd.
 */
export const adresseSoumise = (lieu: LieuAReprendre): AdresseSoumise => ({
  lieuId: lieu.id,
  voie: nettoyerVoiePourRecherche(lieu.adresse),
  commune: lieu.commune,
  codePostal: lieu.codePostal,
  codeInsee: lieu.codeInsee,
})

const dejaConforme = (lieu: LieuAReprendre, rendue: AdresseGeocodee): boolean =>
  lieu.banId === rendue.banId &&
  lieu.adresse === rendue.voie &&
  lieu.commune === rendue.commune &&
  lieu.codePostal === rendue.codePostal &&
  lieu.codeInsee === rendue.codeInsee &&
  lieu.latitude === rendue.latitude &&
  lieu.longitude === rendue.longitude

/**
 * Une adresse ne se garde que si la Base Adresse Nationale la rend elle-même.
 *
 * Un repli sur le centre de la commune ne désigne pas un lieu, une voie trouvée
 * dans une autre commune contredit ce qui est enregistré, et un appariement
 * faible n'est qu'une ressemblance. Aucun des trois n'est corrigé d'office : ils
 * paraissent au relevé avec leur motif, pour qu'on les tranche un par un.
 */
const motifDuRefus = (
  lieu: LieuAReprendre,
  rendue: AdresseGeocodee | undefined,
): string | null => {
  if (rendue == null) return MOTIFS.sansReponse
  if (!TYPES_PRECIS.has(rendue.type)) return MOTIFS.repli
  if (rendue.codeInsee !== lieu.codeInsee) return MOTIFS.autreCommune
  if (rendue.score < SCORE_MINIMAL) return MOTIFS.scoreInsuffisant

  return null
}

export const adresseDeLAdresse = (
  lieu: LieuAReprendre,
  rendue: AdresseGeocodee | undefined,
): AdresseGeocodee | null =>
  rendue != null && motifDuRefus(lieu, rendue) == null ? rendue : null

/**
 * L'adresse que la Base Adresse Nationale trouve au point du lieu.
 *
 * Des imports ont ecrit dans la ligne de voie le nom de la commune, celui du
 * batiment, ou rien du tout, tout en posant des coordonnees justes. Le point,
 * lui, ne ment pas : on lui demande ce qui s'y trouve. Encore faut-il que
 * l'adresse rendue soit a portee — au-dela d'une vingtaine de metres, ce n'est
 * plus le meme endroit — et dans la commune enregistree, faute de quoi ce sont
 * les coordonnees qui sont fausses.
 */
const UN_TYPE_DE_VOIE = new RegExp(
  `(?:^|[^\\p{L}])(?:${TYPES_DE_VOIE}|${Object.keys(ABREVIATIONS_DE_TYPE_DE_VOIE).join('|')})(?![\\p{L}\\d])`,
  'iu',
)

const sansAccents = (valeur: string): string =>
  valeur
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, ' ')
    .trim()

/**
 * La ligne de voie ne dit pas de voie.
 *
 * Elle est vide, elle répète le nom de la commune, ou elle ne nomme aucun des
 * types de voie que le standard connaît — « Le Bourg », « Metairie Loaven »,
 * « Pierrecourt ». Alors, et alors seulement, le point a quelque chose à nous
 * apprendre : là où une voie est écrite, c'est elle qui fait foi, et la
 * remplacer par ce qui se trouve au point reviendrait à croire les coordonnées
 * plus que la saisie.
 */
export const voieMuette = (lieu: LieuAReprendre): boolean => {
  const voie = lieu.adresse.trim()

  return (
    voie === '' ||
    sansAccents(voie) === sansAccents(lieu.commune) ||
    !UN_TYPE_DE_VOIE.test(voie)
  )
}

export const adresseDesCoordonnees = (
  lieu: LieuAReprendre,
  retrouvee: AdresseRetrouvee | undefined,
): AdresseGeocodee | null =>
  retrouvee != null &&
  voieMuette(lieu) &&
  TYPES_PRECIS.has(retrouvee.type) &&
  retrouvee.codeInsee === lieu.codeInsee &&
  retrouvee.distance <= DISTANCE_MAXIMALE
    ? retrouvee
    : null

export const adresseAReprendre = (
  lieu: LieuAReprendre,
  rendue: AdresseGeocodee | undefined,
  retrouvee?: AdresseRetrouvee,
): AdresseAReprendre | null => {
  const adresse =
    adresseDeLAdresse(lieu, rendue) ?? adresseDesCoordonnees(lieu, retrouvee)

  if (adresse == null)
    return {
      verdict: 'a-verifier',
      motif: motifDuRefus(lieu, rendue) ?? MOTIFS.sansReponse,
    }

  return dejaConforme(lieu, adresse) ? null : { verdict: 'a-corriger', adresse }
}
