import {
  type LieuAReprendre,
  type Reprise,
  repriseAvecPrealable,
} from '../../../domain'
import {
  type AdresseAReprendre,
  type AdresseGeocodee,
  type AdresseRetrouvee,
  type AdresseSoumise,
  adresseAReprendre,
  adresseDeLAdresse,
  adresseSoumise,
  type CoordonneesSoumises,
  coordonneesSoumises,
} from './adresse-a-reprendre'

const COLONNE = 'adresse'

const A_CORRIGER = 'à corriger'

export type GeocoderLesAdresses = (
  adresses: readonly AdresseSoumise[],
) => Promise<ReadonlyMap<string, readonly AdresseGeocodee[]>>

export type RetrouverParLesCoordonnees = (
  coordonnees: readonly CoordonneesSoumises[],
) => Promise<ReadonlyMap<string, AdresseRetrouvee>>

export type ReprendreLAdresse = (
  lieuId: string,
  adresse: AdresseGeocodee,
) => Promise<void>

/**
 * Ce que la Base Adresse Nationale a répondu sur l'ensemble des lieux : par
 * l'adresse d'abord, puis par les coordonnées pour ceux que l'adresse n'a pas
 * suffi à situer.
 */
export type AdressesRendues = {
  readonly parLAdresse: ReadonlyMap<string, readonly AdresseGeocodee[]>
  readonly parLesCoordonnees: ReadonlyMap<string, AdresseRetrouvee>
}

const cellule = (aReprendre: AdresseAReprendre): string =>
  aReprendre.verdict === 'a-corriger'
    ? A_CORRIGER
    : `à vérifier : ${aReprendre.motif}`

const motif = (aReprendre: AdresseAReprendre): string =>
  aReprendre.verdict === 'a-corriger'
    ? `${COLONNE} : ${A_CORRIGER}`
    : `${COLONNE} : ${aReprendre.motif}`

const appliquer =
  (reprendreLAdresse: ReprendreLAdresse) =>
  async (lieuId: string, aReprendre: AdresseAReprendre): Promise<void> => {
    if (aReprendre.verdict === 'a-verifier') return

    await reprendreLAdresse(lieuId, aReprendre.adresse)
  }

/**
 * On n'interroge par les coordonnées que les lieux dont l'adresse n'a pas suffi.
 * Le point est un recours, pas une source : quand la Base Adresse Nationale
 * reconnaît déjà l'adresse écrite, c'est elle qui fait foi.
 */
const adressesRendues =
  (
    geocoderLesAdresses: GeocoderLesAdresses,
    retrouverParLesCoordonnees: RetrouverParLesCoordonnees,
  ) =>
  async (lieux: readonly LieuAReprendre[]): Promise<AdressesRendues> => {
    const parLAdresse = await geocoderLesAdresses(lieux.map(adresseSoumise))

    const aRetrouver = lieux.filter(
      (lieu) => adresseDeLAdresse(lieu, parLAdresse.get(lieu.id) ?? []) == null,
    )

    return {
      parLAdresse,
      parLesCoordonnees: await retrouverParLesCoordonnees(
        aRetrouver.flatMap(coordonneesSoumises),
      ),
    }
  }

export const repriseDeLAdresse = (
  geocoderLesAdresses: GeocoderLesAdresses,
  retrouverParLesCoordonnees: RetrouverParLesCoordonnees,
  reprendreLAdresse: ReprendreLAdresse,
): Reprise =>
  repriseAvecPrealable<AdresseAReprendre, AdressesRendues>({
    colonnes: [COLONNE],
    preparer: adressesRendues(geocoderLesAdresses, retrouverParLesCoordonnees),
    constater: (lieu, { parLAdresse, parLesCoordonnees }) =>
      adresseAReprendre(
        lieu,
        parLAdresse.get(lieu.id) ?? [],
        parLesCoordonnees.get(lieu.id),
      ),
    mentions: (aReprendre) => [
      {
        colonne: COLONNE,
        cellule: cellule(aReprendre),
        motif: motif(aReprendre),
      },
    ],
    appliquer: appliquer(reprendreLAdresse),
  })
