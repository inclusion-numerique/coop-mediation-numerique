import { nettoyerVoiePourRecherche } from '@gouvfr-anct/lieux-de-mediation-numerique'
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

const TYPES_PRECIS: ReadonlySet<string> = new Set(['housenumber', 'street'])

const MOTIFS = {
  sansReponse: 'la Base Adresse Nationale ne rend rien',
  repli: 'la voie est introuvable',
  autreCommune: 'une autre commune que celle enregistrée',
  scoreInsuffisant: 'score insuffisant',
} as const

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
export const adresseAReprendre = (
  lieu: LieuAReprendre,
  rendue: AdresseGeocodee | undefined,
): AdresseAReprendre | null => {
  if (rendue == null)
    return { verdict: 'a-verifier', motif: MOTIFS.sansReponse }

  if (!TYPES_PRECIS.has(rendue.type))
    return { verdict: 'a-verifier', motif: MOTIFS.repli }

  if (rendue.codeInsee !== lieu.codeInsee)
    return { verdict: 'a-verifier', motif: MOTIFS.autreCommune }

  if (rendue.score < SCORE_MINIMAL)
    return { verdict: 'a-verifier', motif: MOTIFS.scoreInsuffisant }

  return dejaConforme(lieu, rendue)
    ? null
    : { verdict: 'a-corriger', adresse: rendue }
}
