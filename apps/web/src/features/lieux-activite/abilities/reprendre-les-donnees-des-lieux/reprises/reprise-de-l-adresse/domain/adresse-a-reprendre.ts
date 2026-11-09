import {
  ABREVIATIONS_DE_TYPE_DE_VOIE,
  ComplementAdresse,
  distanceEnMetres,
  nettoyerVoie,
  nettoyerVoiePourRecherche,
  similarite,
  TYPES_DE_VOIE,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuAReprendre } from '../../../domain'

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
  readonly exAequo?: boolean
}

export type AdresseRetrouvee = AdresseGeocodee & {
  readonly distance: number
  readonly voieSansLeNumero: string
  readonly distanceAuCentreDeLaCommune: number | null
}

export type CoordonneesSoumises = {
  readonly lieuId: string
  readonly latitude: number
  readonly longitude: number
  readonly codeInsee: string | null
  readonly commune: string
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
  readonly complement: string | null
}

export type AdresseAReprendre =
  | { readonly verdict: 'a-corriger'; readonly adresse: AdresseGeocodee }
  | {
      readonly verdict: 'a-corriger-d-apres-le-registre'
      readonly adresse: AdresseGeocodee
      readonly complement: ComplementAdresse | null
    }
  | {
      readonly verdict: 'a-corriger-d-apres-l-annuaire'
      readonly adresse: AdresseGeocodee
    }
  | { readonly verdict: 'a-supprimer'; readonly motif: string }
  | { readonly verdict: 'a-faire-corriger'; readonly motif: string }
  | { readonly verdict: 'a-verifier'; readonly motif: string }

const SCORE_MINIMAL = 0.9

const MEME_ENDROIT = 25

const AU_CENTRE_DE_LA_COMMUNE = 30

const RAPPROCHEMENT_MINIMAL = 95

const BONUS_MAXIMAL = 20

const DISTANCE_PIVOT = 15

const CONFIRMATION_MINIMALE = 80

const TYPES_UTILISABLES: ReadonlySet<string> = new Set([
  'housenumber',
  'street',
  'locality',
])

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
          commune: lieu.commune,
        },
      ]

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

const exAequoSousLeLibelleDuLieu = (
  lieu: LieuAReprendre,
  rendue: AdresseGeocodee,
): boolean =>
  rendue.exAequo === true &&
  lieu.banId != null &&
  lieu.adresse === rendue.voie &&
  lieu.codeInsee === rendue.codeInsee

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

const bonusDeProximite = (ecart: number | null): number =>
  ecart == null
    ? 0
    : Math.max(
        -2 * BONUS_MAXIMAL,
        Math.round(BONUS_MAXIMAL * (1 - ecart / DISTANCE_PIVOT)),
      )

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

const memeVoieMotAMot = (ecrite: string, rendue: string): boolean => {
  const ecrits = motsDe(ecrite)
  const rendus = motsDe(rendue)

  return tousPresents(rendus, ecrits) || tousPresents(ecrits, rendus)
}

const memeCodeCommune = (codeInsee: string, rendue: AdresseGeocodee): boolean =>
  rendue.codeInsee === codeInsee ||
  rendue.ancienCodeInsee === codeInsee ||
  (ARRONDISSEMENTS.get(codeInsee)?.test(rendue.codeInsee) ?? false) ||
  (ARRONDISSEMENTS.get(rendue.codeInsee)?.test(codeInsee) ?? false)

const memeCommune = (lieu: LieuAReprendre, rendue: AdresseGeocodee): boolean =>
  lieu.codeInsee != null && memeCodeCommune(lieu.codeInsee, rendue)

const reconnue = (lieu: LieuAReprendre, rendue: AdresseGeocodee): boolean =>
  rendue.score >= SCORE_MINIMAL ||
  rapprochement(lieu, rendue) >= RAPPROCHEMENT_MINIMAL ||
  (memeVoieMotAMot(voieCherchee(lieu), rendue.voie) &&
    auMemeEndroit(lieu, rendue))

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
  lieu: LieuAReprendre,
  rendues: readonly AdresseGeocodee[],
): readonly AdresseGeocodee[] =>
  [...rendues].sort(
    (une, autre) =>
      autre.score - une.score ||
      Number(autre.banId === lieu.banId) - Number(une.banId === lieu.banId),
  )

export const adresseDeLAdresse = (
  lieu: LieuAReprendre,
  rendues: readonly AdresseGeocodee[],
): AdresseGeocodee | null =>
  parScoreDecroissant(lieu, rendues).find(
    (rendue) => motifDuRefus(lieu, rendue) == null,
  ) ?? null

const UN_TYPE_DE_VOIE = new RegExp(
  `(?:^|[^\\p{L}])(?:${TYPES_DE_VOIE}|${Object.keys(ABREVIATIONS_DE_TYPE_DE_VOIE).join('|')})(?![\\p{L}\\d])`,
  'iu',
)

export const voieMuette = (lieu: LieuAReprendre): boolean => {
  const voie = lieu.adresse.trim()

  return (
    voie === '' ||
    sansAccents(voie) === sansAccents(lieu.commune) ||
    !UN_TYPE_DE_VOIE.test(voie)
  )
}

const voieConfirmee = (
  lieu: LieuAReprendre,
  voieSansLeNumero: string,
): boolean =>
  memeVoieMotAMot(voieCherchee(lieu), voieSansLeNumero) ||
  similarite(sansAccents(voieCherchee(lieu)), sansAccents(voieSansLeNumero)) >=
    CONFIRMATION_MINIMALE

const pointAuCentreDeLaCommune = (retrouvee: AdresseRetrouvee): boolean =>
  retrouvee.distanceAuCentreDeLaCommune != null &&
  retrouvee.distanceAuCentreDeLaCommune <= AU_CENTRE_DE_LA_COMMUNE

export const adresseDesCoordonnees = (
  lieu: LieuAReprendre,
  retrouvee: AdresseRetrouvee | undefined,
): AdresseGeocodee | null =>
  retrouvee != null &&
  !pointAuCentreDeLaCommune(retrouvee) &&
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

const TYPES_DU_REGISTRE: ReadonlySet<string> = new Set([
  ...TYPES_UTILISABLES,
  'municipality',
])

const complementConsigne = (
  consignee: AdresseConsignee | undefined,
): ComplementAdresse | null =>
  consignee?.complement == null
    ? null
    : ComplementAdresse.safe(consignee.complement)

const complementEnPlace = (
  lieu: LieuAReprendre,
  complement: ComplementAdresse | null,
): boolean => complement == null || lieu.complementAdresse === complement

export const adresseDuRegistre = (
  consignee: AdresseConsignee | undefined,
): AdresseGeocodee | null => {
  const rendue = consignee?.rendue

  return consignee != null &&
    rendue != null &&
    TYPES_DU_REGISTRE.has(rendue.type) &&
    rendue.score >= SCORE_MINIMAL &&
    memeCodeCommune(consignee.codeInsee, rendue)
    ? rendue
    : null
}

const nAccompagneRien = (lieu: LieuAReprendre): boolean =>
  lieu.accompagnements === 0

const MOIS_D_INACTIVITE = 6

const ilYA = (mois: number, maintenant: Date): Date =>
  new Date(
    Date.UTC(
      maintenant.getUTCFullYear(),
      maintenant.getUTCMonth() - mois,
      maintenant.getUTCDate(),
    ),
  )

const inactif = (lieu: LieuAReprendre, maintenant: Date): boolean =>
  lieu.derniereActivite == null ||
  lieu.derniereActivite < ilYA(MOIS_D_INACTIVITE, maintenant)

export const confieeAuLieuSiInactif = (
  lieu: LieuAReprendre,
  aReprendre: AdresseAReprendre | null,
  maintenant: Date,
): AdresseAReprendre | null =>
  aReprendre?.verdict === 'a-verifier' && inactif(lieu, maintenant)
    ? { verdict: 'a-faire-corriger', motif: aReprendre.motif }
    : aReprendre

const dejaConfiee = (lieu: LieuAReprendre): boolean =>
  !lieu.publie && lieu.banId == null

export const sansLeLieuDejaConfie = (
  lieu: LieuAReprendre,
  aReprendre: AdresseAReprendre | null,
): AdresseAReprendre | null =>
  aReprendre?.verdict === 'a-faire-corriger' && dejaConfiee(lieu)
    ? null
    : aReprendre

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

  if (duRegistre != null) {
    const complement = complementConsigne(consignee)

    return dejaConforme(lieu, duRegistre) && complementEnPlace(lieu, complement)
      ? null
      : {
          verdict: 'a-corriger-d-apres-le-registre',
          adresse: duRegistre,
          complement,
        }
  }

  if (deLAnnuaire != null)
    return dejaConforme(lieu, deLAnnuaire)
      ? null
      : { verdict: 'a-corriger-d-apres-l-annuaire', adresse: deLAnnuaire }

  if (adresse == null) {
    const motif =
      motifDuRefus(lieu, parScoreDecroissant(lieu, rendues)[0]) ??
      MOTIFS.sansReponse

    return nAccompagneRien(lieu)
      ? { verdict: 'a-supprimer', motif }
      : { verdict: 'a-verifier', motif }
  }

  return dejaConforme(lieu, adresse) ||
    exAequoSousLeLibelleDuLieu(lieu, adresse)
    ? null
    : { verdict: 'a-corriger', adresse }
}
