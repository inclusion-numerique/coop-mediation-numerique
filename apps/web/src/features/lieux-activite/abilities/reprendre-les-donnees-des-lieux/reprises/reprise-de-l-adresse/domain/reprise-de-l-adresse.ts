import {
  type LieuAReprendre,
  type Reprise,
  repriseAvecPrealable,
} from '../../../domain'
import {
  type AdresseAReprendre,
  type AdresseGeocodee,
  type AdresseSoumise,
  adresseAReprendre,
  adresseSoumise,
} from './adresse-a-reprendre'

const COLONNE = 'adresse'

const A_CORRIGER = 'à corriger'

export type GeocoderLesAdresses = (
  adresses: readonly AdresseSoumise[],
) => Promise<ReadonlyMap<string, AdresseGeocodee>>

export type ReprendreLAdresse = (
  lieuId: string,
  adresse: AdresseGeocodee,
) => Promise<void>

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

export const repriseDeLAdresse = (
  geocoderLesAdresses: GeocoderLesAdresses,
  reprendreLAdresse: ReprendreLAdresse,
): Reprise =>
  repriseAvecPrealable<AdresseAReprendre, ReadonlyMap<string, AdresseGeocodee>>(
    {
      colonnes: [COLONNE],
      preparer: (lieux: readonly LieuAReprendre[]) =>
        geocoderLesAdresses(lieux.map(adresseSoumise)),
      constater: (lieu, rendues) =>
        adresseAReprendre(lieu, rendues.get(lieu.id)),
      mentions: (aReprendre) => [
        {
          colonne: COLONNE,
          cellule: cellule(aReprendre),
          motif: motif(aReprendre),
        },
      ],
      appliquer: appliquer(reprendreLAdresse),
    },
  )
