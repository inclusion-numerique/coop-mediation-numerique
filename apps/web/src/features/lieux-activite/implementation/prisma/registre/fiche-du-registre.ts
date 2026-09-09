import {
  Adresse,
  Contact,
  Courriel,
  isValidAddress,
  isValidCourriel,
  isValidTelephone,
  isValidUrl,
  Nom,
  type Presentation,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Prisma } from '@prisma/client'
import type { Fiche } from '../../../domain/fiche'
import * as vocabulaire from '../vocabulaire'

/** Le séparateur multi-valeurs du schéma national. */
const SEPARATEUR_LISTE = '|'

/**
 * Ce qu'il faut lire d'une inscription pour en tirer la fiche du lieu.
 *
 * L'adresse est jointe : elle vit dans `main.adresse`, partagée entre les lieux
 * et les structures administratives. `geom` en est absent — Prisma le type
 * `Unsupported("geometry")` et ne sait pas le rendre — d'où des coordonnées qui
 * restent celles de la coop.
 */
export const inscriptionPourLaFiche = {
  select: {
    nom: true,
    nomUsage: true,
    complementAdresse: true,
    visiblePourCartographieNationale: true,
    ficheAccesLibre: true,
    priseRdv: true,
    horaires: true,
    presentationResume: true,
    presentationDetail: true,
    siretALEnrichissement: true,
    structureCartographieNationaleId: true,
    contact: true,
    typologies: true,
    services: true,
    publicsSpecifiquementAdresses: true,
    priseEnChargeSpecifique: true,
    modalitesAcces: true,
    fraisACharge: true,
    itinerance: true,
    dispositifProgrammesNationaux: true,
    formationsLabels: true,
    autresFormationsLabels: true,
    modalitesAccompagnement: true,
    source: true,
    updatedAtCarto: true,
    updatedAtCoop: true,
    updatedAtMin: true,
    adresse: {
      select: {
        codePostal: true,
        codeInsee: true,
        nomCommune: true,
        nomVoie: true,
        numeroVoie: true,
        repetition: true,
        codeBan: true,
      },
    },
  },
} satisfies Prisma.LieuInclusionRegistreMainDefaultArgs

export type InscriptionPourLaFiche = Prisma.LieuInclusionRegistreMainGetPayload<
  typeof inscriptionPourLaFiche
>

const nonVide = (valeur: string | null): string | null =>
  valeur != null && valeur.trim() !== '' ? valeur : null

/**
 * Le `jsonb` `contact` du registre, relu.
 *
 * Tous les producteurs y écrivent la même forme — `telephone`, `site_web`, et
 * `courriels` en objet à clé `email` dont la valeur joint les adresses par le
 * séparateur du standard ; c'est vérifié sur les 24 302 lignes. La lecture reste
 * néanmoins défensive : la colonne est un `jsonb` que rien ne contraint, et une
 * fiche illisible vaut mieux qu'un écran qui refuse de s'afficher.
 */
const contactDuRegistre = (contact: Prisma.JsonValue): Contact => {
  if (contact == null || typeof contact !== 'object' || Array.isArray(contact))
    return Contact({})

  const champ = (clef: string): string | null => {
    const valeur = (contact as Record<string, unknown>)[clef]

    return typeof valeur === 'string' ? nonVide(valeur) : null
  }

  const courriels = (contact as Record<string, unknown>).courriels
  const email =
    courriels != null &&
    typeof courriels === 'object' &&
    !Array.isArray(courriels)
      ? (courriels as Record<string, unknown>).email
      : null

  const adresses = (typeof email === 'string' ? email : '')
    .split(SEPARATEUR_LISTE)
    .map((jeton) => jeton.trim())
    .filter(isValidCourriel)
    .map(Courriel)

  const sitesWeb = (champ('site_web') ?? '')
    .split(SEPARATEUR_LISTE)
    .map((jeton) => jeton.trim())
    .filter(isValidUrl)
    .map(Url)

  const telephone = champ('telephone')

  return Contact({
    ...(telephone != null && isValidTelephone(telephone) ? { telephone } : {}),
    ...(adresses.length > 0 ? { courriels: [...adresses] } : {}),
    ...(sitesWeb.length > 0 ? { site_web: [...sitesWeb] } : {}),
  })
}

/**
 * La voie, recomposée depuis ce que le registre range en colonnes séparées.
 *
 * `12`, `bis`, `Rue du Port` redeviennent « 12 bis Rue du Port » — la forme que
 * la coop stocke d'un bloc et que les écrans affichent.
 */
const voieDuRegistre = ({
  numeroVoie,
  repetition,
  nomVoie,
}: NonNullable<InscriptionPourLaFiche['adresse']>): string =>
  [numeroVoie?.toString(), nonVide(repetition), nonVide(nomVoie)]
    .filter((jeton): jeton is string => jeton != null)
    .join(' ')

/**
 * L'adresse du registre, ou `null` si elle n'en dit pas assez.
 *
 * 216 inscriptions n'ont pas de `nom_voie` là où la coop a une adresse : le
 * `null` rendu ici laisse l'appelant se rabattre sur la sienne plutôt que
 * d'afficher une adresse amputée.
 */
export const adresseDuRegistre = (
  inscription: InscriptionPourLaFiche,
): Adresse | null => {
  const { adresse, complementAdresse } = inscription

  if (adresse == null) return null

  const complement = nonVide(complementAdresse)
  const candidate = {
    voie: voieDuRegistre(adresse),
    commune: adresse.nomCommune,
    code_postal: adresse.codePostal,
    code_insee: adresse.codeInsee,
    ...(complement == null ? {} : { complement_adresse: complement }),
  }

  return isValidAddress(candidate) ? Adresse(candidate) : null
}

/**
 * Les champs d'affichage d'un lieu, tels que le registre les porte — `null`
 * quand il n'en dit rien, à charge de l'appelant de se rabattre sur la coop.
 *
 * Sert les projections de liste, qui montrent le lieu sans construire un `Lieu`
 * du domaine : elles n'ont besoin ni du pivot, ni des coordonnées, ni des
 * nomenclatures traduites.
 */
export const champsDAffichage = (inscription: InscriptionPourLaFiche) => {
  const adresse = adresseDuRegistre(inscription)

  return {
    nom: inscription.nom,
    nomUsage: inscription.nomUsage,
    adresse: adresse?.voie ?? null,
    complementAdresse: adresse?.complement_adresse ?? null,
    commune: adresse?.commune ?? null,
    codePostal: adresse?.code_postal ?? null,
    codeInsee: adresse?.code_insee ?? null,
    typologies: inscription.typologies,
    visiblePourCartographieNationale:
      inscription.visiblePourCartographieNationale,
    structureCartographieNationaleId:
      inscription.structureCartographieNationaleId,
  }
}

const presentationDuRegistre = ({
  presentationResume,
  presentationDetail,
}: InscriptionPourLaFiche): Presentation | null => {
  const resume = nonVide(presentationResume)
  const detail = nonVide(presentationDetail)

  if (resume == null && detail == null) return null

  return {
    ...(resume == null ? {} : { resume }),
    ...(detail == null ? {} : { detail }),
  }
}

/**
 * La fiche telle que le registre la porte.
 *
 * Miroir de `lieuVersRegistre` : les mêmes colonnes, dans l'autre sens. Les
 * nomenclatures du registre acceptent les mêmes valeurs que celles de la coop —
 * `ligne-du-registre.ts` en fait une garde de compilation — et se traduisent
 * donc par le même vocabulaire.
 *
 * `pivot` et `localisation` n'en viennent pas : le registre n'a pas de RNA, son
 * `siret_a_l_enrichissement` est vide sur les 12 765 inscriptions, et `geom` est
 * illisible par Prisma. L'appelant les tient de la coop.
 */
export const ficheDuRegistre = (
  inscription: InscriptionPourLaFiche,
  depuisLaCoop: Pick<Fiche, 'pivot' | 'localisation' | 'adresse'>,
): Fiche => ({
  nom: Nom(inscription.nom),
  pivot: depuisLaCoop.pivot,
  adresse: adresseDuRegistre(inscription) ?? depuisLaCoop.adresse,
  localisation: depuisLaCoop.localisation,
  typologies: vocabulaire.traduites(
    inscription.typologies,
    vocabulaire.typologie.versStandard,
  ),
  contact: contactDuRegistre(inscription.contact),
  horaires: nonVide(inscription.horaires),
  presentation: presentationDuRegistre(inscription),
  services: vocabulaire.traduites(
    inscription.services,
    vocabulaire.service.versStandard,
  ),
  publicsSpecifiquementAdresses: vocabulaire.traduites(
    inscription.publicsSpecifiquementAdresses,
    vocabulaire.publicSpecifiquementAdresse.versStandard,
  ),
  priseEnChargeSpecifique: vocabulaire.traduites(
    inscription.priseEnChargeSpecifique,
    vocabulaire.priseEnChargeSpecifique.versStandard,
  ),
  modalitesAcces: vocabulaire.traduites(
    inscription.modalitesAcces,
    vocabulaire.modaliteAcces.versStandard,
  ),
  fraisACharge: vocabulaire.traduites(
    inscription.fraisACharge,
    vocabulaire.fraisACharge.versStandard,
  ),
  itinerance: vocabulaire.traduites(
    inscription.itinerance,
    vocabulaire.itinerance.versStandard,
  ),
  dispositifProgrammesNationaux: vocabulaire.traduites(
    inscription.dispositifProgrammesNationaux,
    vocabulaire.dispositifProgrammeNational.versStandard,
  ),
  formationsLabels: vocabulaire.traduites(
    inscription.formationsLabels,
    vocabulaire.formationLabel.versStandard,
  ),
  autresFormationsLabels: inscription.autresFormationsLabels,
  modalitesAccompagnement: vocabulaire.traduites(
    inscription.modalitesAccompagnement,
    vocabulaire.modaliteAccompagnement.versStandard,
  ),
  ficheAccesLibre: isValidUrl(inscription.ficheAccesLibre ?? '')
    ? Url(inscription.ficheAccesLibre ?? '')
    : null,
  priseRdv: isValidUrl(inscription.priseRdv ?? '')
    ? Url(inscription.priseRdv ?? '')
    : null,
})
