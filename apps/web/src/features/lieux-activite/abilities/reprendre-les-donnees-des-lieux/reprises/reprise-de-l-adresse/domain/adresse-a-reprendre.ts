import {
  ABREVIATIONS_DE_TYPE_DE_VOIE,
  distanceEnMetres,
  nettoyerVoie,
  nettoyerVoiePourRecherche,
  similarite,
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
  readonly ancienCodeInsee: string
  readonly latitude: number
  readonly longitude: number
  readonly libelle: string
}

/** Ce que la Base Adresse Nationale trouve au point qu'on lui montre. */
export type AdresseRetrouvee = AdresseGeocodee & {
  readonly distance: number
  readonly voieSansLeNumero: string
}

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

export type ServiceDesigne = 'mairie' | 'ccas' | 'france_services' | 'mds'

export type ServiceDemande = {
  readonly lieuId: string
  readonly codeInsee: string
  readonly service: ServiceDesigne
}

export type AdresseConsignee = {
  readonly codeInsee: string
  readonly rendue: AdresseGeocodee | null
}

export type AdresseAReprendre =
  | { readonly verdict: 'a-corriger'; readonly adresse: AdresseGeocodee }
  | {
      readonly verdict: 'a-corriger-d-apres-le-registre'
      readonly adresse: AdresseGeocodee
    }
  | {
      readonly verdict: 'a-corriger-d-apres-l-annuaire'
      readonly adresse: AdresseGeocodee
    }
  | { readonly verdict: 'a-supprimer'; readonly motif: string }
  | { readonly verdict: 'a-verifier'; readonly motif: string }

const SCORE_MINIMAL = 0.9

/**
 * Au-delà, le point et l'adresse rendue ne désignent plus le même endroit : une
 * vingtaine de mètres sépare deux entrées d'un même bâtiment, pas deux
 * bâtiments.
 */
const MEME_ENDROIT = 25

/**
 * Ce qu'il faut de ressemblance, une fois la distance prise en compte, pour
 * tenir deux libellés pour la même voie quand la Base Adresse Nationale, elle,
 * n'est pas assez sûre d'elle.
 */
const RAPPROCHEMENT_MINIMAL = 95

const BONUS_MAXIMAL = 20

/** La distance à laquelle le bonus s'annule : au-delà, il pénalise. */
const DISTANCE_PIVOT = 15

/** Ce qu'il faut de ressemblance pour que le point confirme la voie écrite. */
const CONFIRMATION_MINIMALE = 80

/**
 * Un lieu-dit est une adresse entière là où il n'y a pas de voie : « Le Bourg »,
 * « Terres Sainville », « Bois de Nèfles ». La Base Adresse Nationale le range à
 * part de ses voies, mais c'est bien l'adresse du lieu.
 */
const TYPES_UTILISABLES: ReadonlySet<string> = new Set([
  'housenumber',
  'street',
  'locality',
])

/**
 * Paris, Marseille et Lyon portent un code de commune que la Base Adresse
 * Nationale n'emploie pas : elle répond par l'arrondissement. Les deux désignent
 * la même ville.
 */
const ARRONDISSEMENTS: ReadonlyMap<string, RegExp> = new Map([
  ['75056', /^751\d\d$/u],
  ['13055', /^132\d\d$/u],
  ['69123', /^693[89]\d$/u],
])

const MOTIFS = {
  sansReponse: 'la Base Adresse Nationale ne rend rien',
  repli: 'la voie est introuvable',
  autreCommune: 'une autre commune que celle enregistrée',
  scoreInsuffisant: 'score insuffisant',
  numeroPerdu: 'le numéro de voie serait perdu',
} as const

const COMMENCE_PAR_UN_NUMERO = /^\s*\d/u

const UNE_PLAQUE = 'housenumber'

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
 * `nettoyerVoie` passe d'abord : il développe les abréviations de type de voie
 * et, surtout, coupe la ligne au code postal — des imports y ont recopié
 * l'adresse entière, si bien que la Base Adresse Nationale comparait
 * « 26 Rue Famelart 59200 Tourcoing » à « 26 Rue Famelart » et faisait chuter
 * l'appariement. Cent onze lieux franchissent le seuil pour cette seule raison.
 *
 * `enCasseNaturelle` n'y figure pas : la Base Adresse Nationale compare déjà
 * sans tenir compte de la casse, et la mesure ne lui trouve aucun effet.
 */
const voieCherchee = (lieu: LieuAReprendre): string =>
  nettoyerVoiePourRecherche(nettoyerVoie(lieu.adresse))

export const adresseSoumise = (lieu: LieuAReprendre): AdresseSoumise => ({
  lieuId: lieu.id,
  voie: voieCherchee(lieu),
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

const ecartEnMetres = (
  lieu: LieuAReprendre,
  rendue: AdresseGeocodee,
): number | null =>
  lieu.latitude == null || lieu.longitude == null
    ? null
    : Math.abs(
        distanceEnMetres(
          { latitude: lieu.latitude, longitude: lieu.longitude },
          { latitude: rendue.latitude, longitude: rendue.longitude },
        ),
      )

const auMemeEndroit = (
  lieu: LieuAReprendre,
  rendue: AdresseGeocodee,
): boolean =>
  (ecartEnMetres(lieu, rendue) ?? Number.POSITIVE_INFINITY) <= MEME_ENDROIT

/**
 * Ce que la proximité ajoute — ou retire — à la ressemblance des libellés.
 *
 * Deux adresses au même point et dont le nom propre coïncide sont la même, même
 * si l'une dit « place » et l'autre « chemin » : c'est une saisie mal qualifiée,
 * pas un autre endroit. Le bonus est donc maximal à zéro mètre, nul au pivot, et
 * pénalise ensuite — s'éloigner est un indice bien plus fort que se ressembler.
 */
const bonusDeProximite = (ecart: number | null): number =>
  ecart == null
    ? 0
    : Math.max(
        -2 * BONUS_MAXIMAL,
        Math.round(BONUS_MAXIMAL * (1 - ecart / DISTANCE_PIVOT)),
      )

/**
 * La comparaison porte sur la voie telle qu'on l'a cherchée, et non telle
 * qu'elle est enregistrée : c'est la réponse à cette question-là que la Base
 * Adresse Nationale rend. Comparer la ligne brute ferait échouer « 3 AV MAL
 * FOCH » contre « Avenue du Maréchal Foch » alors que la recherche est partie
 * de « 3 Avenue Maréchal FOCH ».
 *
 * Le score de la Base Adresse Nationale mêle la ressemblance du libellé à sa
 * propre confiance, et chute pour des raisons qui ne nous regardent pas : une
 * particule, un hameau entre parenthèses, un prénom qu'elle connaît et pas
 * nous. On lui oppose donc notre propre rapprochement — la ressemblance des
 * voies, corrigée par la distance.
 */
export const rapprochement = (
  lieu: LieuAReprendre,
  rendue: AdresseGeocodee,
): number =>
  similarite(voieCherchee(lieu).toLowerCase(), rendue.voie.toLowerCase()) +
  bonusDeProximite(ecartEnMetres(lieu, rendue))

const sansAccents = (valeur: string): string =>
  valeur
    .normalize('NFD')
    .replaceAll(/[̀-ͯ]/gu, '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, ' ')
    .trim()

const MOTS_VIDES: ReadonlySet<string> = new Set([
  'a',
  'au',
  'aux',
  'd',
  'de',
  'des',
  'du',
  'en',
  'et',
  'l',
  'la',
  'le',
  'les',
])

const motsDe = (valeur: string): readonly string[] =>
  sansAccents(valeur)
    .split(' ')
    .filter((mot) => mot !== '' && !MOTS_VIDES.has(mot))

const tousPresents = (
  attendus: readonly string[],
  parmi: readonly string[],
): boolean =>
  attendus.length > 0 && attendus.every((mot) => parmi.includes(mot))

/**
 * L'une des deux voies contient tous les mots de l'autre.
 *
 * C'est ce que la ressemblance globale rate : la ligne enregistrée porte le nom
 * du bâtiment, du service ou de la commune en plus de la voie — « 32 RUE
 * FREDERIC MISTRAL LA STATION » —, ou c'est la Base Adresse Nationale qui
 * complète un prénom que nous n'avions pas — « 5 Rue Surcouf » contre « 5 Rue
 * Robert Surcouf ». Deux voies réellement différentes ne se contiennent pas.
 */
const memeVoieMotAMot = (ecrite: string, rendue: string): boolean => {
  const ecrits = motsDe(ecrite)
  const rendus = motsDe(rendue)

  return tousPresents(rendus, ecrits) || tousPresents(ecrits, rendus)
}

/**
 * La commune enregistrée et celle que la Base Adresse Nationale rend sont la
 * même : le code est identique, l'un est un arrondissement de l'autre, ou la
 * Base Adresse Nationale signale elle-même que le nôtre est l'ancien code d'une
 * commune nouvelle.
 */
const memeCodeCommune = (codeInsee: string, rendue: AdresseGeocodee): boolean =>
  rendue.codeInsee === codeInsee ||
  rendue.ancienCodeInsee === codeInsee ||
  (ARRONDISSEMENTS.get(codeInsee)?.test(rendue.codeInsee) ?? false) ||
  (ARRONDISSEMENTS.get(rendue.codeInsee)?.test(codeInsee) ?? false)

const memeCommune = (lieu: LieuAReprendre, rendue: AdresseGeocodee): boolean =>
  lieu.codeInsee != null && memeCodeCommune(lieu.codeInsee, rendue)

/**
 * Trois façons de tenir l'adresse rendue pour celle du lieu : la Base Adresse
 * Nationale en répond elle-même, notre rapprochement la reconnaît là où elle
 * doute, ou les deux libellés disent les mêmes mots au même endroit.
 */
const reconnue = (lieu: LieuAReprendre, rendue: AdresseGeocodee): boolean =>
  rendue.score >= SCORE_MINIMAL ||
  rapprochement(lieu, rendue) >= RAPPROCHEMENT_MINIMAL ||
  (memeVoieMotAMot(voieCherchee(lieu), rendue.voie) &&
    auMemeEndroit(lieu, rendue))

/**
 * L'adresse rendue n'a pas de numéro là où la nôtre en porte un.
 *
 * Au même endroit, c'est sans conséquence : la Base Adresse Nationale ne connaît
 * pas ce numéro-là, et son point est celui du lieu. Plus loin, en revanche,
 * l'adresse « à la voie » n'est plus qu'une ressemblance de nom et échangerait
 * une précision contre une source.
 */
const effaceraitLeNumero = (
  lieu: LieuAReprendre,
  rendue: AdresseGeocodee,
): boolean =>
  COMMENCE_PAR_UN_NUMERO.test(voieCherchee(lieu)) &&
  rendue.type !== UNE_PLAQUE &&
  !auMemeEndroit(lieu, rendue)

const motifDuRefus = (
  lieu: LieuAReprendre,
  rendue: AdresseGeocodee | undefined,
): string | null => {
  if (rendue == null) return MOTIFS.sansReponse
  if (!TYPES_UTILISABLES.has(rendue.type)) return MOTIFS.repli
  if (!memeCommune(lieu, rendue)) return MOTIFS.autreCommune
  if (!reconnue(lieu, rendue)) return MOTIFS.scoreInsuffisant
  if (effaceraitLeNumero(lieu, rendue)) return MOTIFS.numeroPerdu

  return null
}

const parScoreDecroissant = (
  rendues: readonly AdresseGeocodee[],
): readonly AdresseGeocodee[] =>
  [...rendues].sort((une, autre) => autre.score - une.score)

/**
 * La Base Adresse Nationale est interrogée de plusieurs façons sur la même
 * adresse ; on garde la première réponse qui tienne, la mieux notée d'abord.
 */
export const adresseDeLAdresse = (
  lieu: LieuAReprendre,
  rendues: readonly AdresseGeocodee[],
): AdresseGeocodee | null =>
  parScoreDecroissant(rendues).find(
    (rendue) => motifDuRefus(lieu, rendue) == null,
  ) ?? null

const UN_TYPE_DE_VOIE = new RegExp(
  `(?:^|[^\\p{L}])(?:${TYPES_DE_VOIE}|${Object.keys(ABREVIATIONS_DE_TYPE_DE_VOIE).join('|')})(?![\\p{L}\\d])`,
  'iu',
)

/**
 * La ligne de voie ne dit pas de voie.
 *
 * Elle est vide, elle répète le nom de la commune, ou elle ne nomme aucun des
 * types de voie que le standard connaît — « Le Bourg », « Metairie Loaven »,
 * « Pierrecourt ». Alors, et alors seulement, le point décide seul de la voie :
 * là où une voie est écrite, elle fait foi, et le point ne peut que la
 * confirmer.
 */
export const voieMuette = (lieu: LieuAReprendre): boolean => {
  const voie = lieu.adresse.trim()

  return (
    voie === '' ||
    sansAccents(voie) === sansAccents(lieu.commune) ||
    !UN_TYPE_DE_VOIE.test(voie)
  )
}

/**
 * Le point confirme la voie écrite : les deux libellés disent les mêmes mots, ou
 * se ressemblent assez. Le numéro n'entre pas dans la comparaison — c'est
 * justement ce que le point apporte ou retire.
 */
const voieConfirmee = (
  lieu: LieuAReprendre,
  voieSansLeNumero: string,
): boolean =>
  memeVoieMotAMot(voieCherchee(lieu), voieSansLeNumero) ||
  similarite(sansAccents(voieCherchee(lieu)), sansAccents(voieSansLeNumero)) >=
    CONFIRMATION_MINIMALE

/**
 * L'adresse que la Base Adresse Nationale trouve au point du lieu.
 *
 * Des imports ont écrit dans la ligne de voie le nom de la commune, celui du
 * bâtiment, ou rien du tout, tout en posant des coordonnées justes. Le point,
 * lui, ne ment pas : on lui demande ce qui s'y trouve. Il pose une voie là où il
 * n'y en avait aucune, il confirme celle qui est écrite — il ne la remplace
 * jamais par une autre.
 */
export const adresseDesCoordonnees = (
  lieu: LieuAReprendre,
  retrouvee: AdresseRetrouvee | undefined,
): AdresseGeocodee | null =>
  retrouvee != null &&
  TYPES_UTILISABLES.has(retrouvee.type) &&
  memeCommune(lieu, retrouvee) &&
  retrouvee.distance <= MEME_ENDROIT &&
  (voieMuette(lieu) || voieConfirmee(lieu, retrouvee.voieSansLeNumero))
    ? retrouvee
    : null

const SERVICES_DESIGNES: readonly (readonly [RegExp, ServiceDesigne])[] = [
  [/\bccas\b|\baction sociale\b/u, 'ccas'],
  [/\bmaisons? (des? )?solidarites?\b|\bmds\b/u, 'mds'],
  [/\bfrance ?services?\b|\bmfs\b/u, 'france_services'],
  [/\bmairie\b|\bcommune\b|\bhotel de ville\b/u, 'mairie'],
]

const UN_AUTRE_BATIMENT =
  /\b(annexe|deleguee|antenne|salle|agence postale|intercommunal|communaute)\b/u

export const serviceDesigne = (nom: string): ServiceDesigne | null => {
  const nomCherche = sansAccents(nom)

  if (UN_AUTRE_BATIMENT.test(nomCherche)) return null

  return (
    SERVICES_DESIGNES.find(([motif]) => motif.test(nomCherche))?.[1] ?? null
  )
}

export const serviceDemande = (
  lieu: LieuAReprendre,
): readonly ServiceDemande[] => {
  const service = serviceDesigne(lieu.nom)

  return service == null || lieu.codeInsee == null
    ? []
    : [{ lieuId: lieu.id, codeInsee: lieu.codeInsee, service }]
}

const UN_NUMERO_EN_TETE = /^\s*\d+\s*(?:bis|ter|[a-z])?\s+/iu

const situeParLAnnuaire = (
  lieu: LieuAReprendre,
  rendue: AdresseGeocodee,
): boolean =>
  TYPES_UTILISABLES.has(rendue.type) &&
  rendue.score >= SCORE_MINIMAL &&
  memeCommune(lieu, rendue) &&
  !(
    COMMENCE_PAR_UN_NUMERO.test(voieCherchee(lieu)) &&
    rendue.type !== UNE_PLAQUE
  ) &&
  (voieMuette(lieu) ||
    voieConfirmee(lieu, rendue.voie.replace(UN_NUMERO_EN_TETE, '')))

export const adresseDeLAnnuaire = (
  lieu: LieuAReprendre,
  services: readonly (AdresseGeocodee | null)[],
): AdresseGeocodee | null => {
  const [seul, ...autres] = services

  return seul != null && autres.length === 0 && situeParLAnnuaire(lieu, seul)
    ? seul
    : null
}

export const adresseDuRegistre = (
  consignee: AdresseConsignee | undefined,
): AdresseGeocodee | null => {
  const rendue = consignee?.rendue

  return consignee != null &&
    rendue != null &&
    TYPES_UTILISABLES.has(rendue.type) &&
    rendue.score >= SCORE_MINIMAL &&
    memeCodeCommune(consignee.codeInsee, rendue)
    ? rendue
    : null
}

/**
 * Un lieu dont l'adresse reste introuvable et qui n'a jamais rien accompagné.
 *
 * Réparer passe avant supprimer, et la suppression n'intervient qu'ici, quand
 * la Base Adresse Nationale a été interrogée de toutes les façons et que rien
 * n'a tenu. Reste alors une fiche que personne ne peut situer ; si elle ne porte
 * aucun accompagnement, elle ne documente rien non plus, et la garder revient à
 * publier une adresse fausse sur la cartographie nationale.
 */
const nAccompagneRien = (lieu: LieuAReprendre): boolean =>
  lieu.accompagnements === 0

export const adresseAReprendre = (
  lieu: LieuAReprendre,
  rendues: readonly AdresseGeocodee[],
  retrouvee?: AdresseRetrouvee,
  parLAnnuaire: readonly (AdresseGeocodee | null)[] = [],
  consignee?: AdresseConsignee,
): AdresseAReprendre | null => {
  const adresse =
    adresseDeLAdresse(lieu, rendues) ?? adresseDesCoordonnees(lieu, retrouvee)
  const duRegistre = adresse == null ? adresseDuRegistre(consignee) : null
  const deLAnnuaire =
    adresse == null && duRegistre == null
      ? adresseDeLAnnuaire(lieu, parLAnnuaire)
      : null

  if (duRegistre != null)
    return dejaConforme(lieu, duRegistre)
      ? null
      : { verdict: 'a-corriger-d-apres-le-registre', adresse: duRegistre }

  if (deLAnnuaire != null)
    return dejaConforme(lieu, deLAnnuaire)
      ? null
      : { verdict: 'a-corriger-d-apres-l-annuaire', adresse: deLAnnuaire }

  if (adresse == null) {
    const motif =
      motifDuRefus(lieu, parScoreDecroissant(rendues)[0]) ?? MOTIFS.sansReponse

    return nAccompagneRien(lieu)
      ? { verdict: 'a-supprimer', motif }
      : { verdict: 'a-verifier', motif }
  }

  return dejaConforme(lieu, adresse) ? null : { verdict: 'a-corriger', adresse }
}
