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
  adresseDesCoordonnees,
  adresseSoumise,
  type CoordonneesSoumises,
  coordonneesSoumises,
  type ServiceDemande,
  serviceDemande,
} from './adresse-a-reprendre'

const COLONNE = 'adresse'

const A_CORRIGER = 'à corriger'

const A_SUPPRIMER = 'à supprimer'

const D_APRES_L_ANNUAIRE = "d'après l'Annuaire de l'administration"

export type GeocoderLesAdresses = (
  adresses: readonly AdresseSoumise[],
) => Promise<ReadonlyMap<string, readonly AdresseGeocodee[]>>

export type RetrouverParLesCoordonnees = (
  coordonnees: readonly CoordonneesSoumises[],
) => Promise<ReadonlyMap<string, AdresseRetrouvee>>

export type ConsulterLAnnuaire = (
  demandes: readonly ServiceDemande[],
) => Promise<ReadonlyMap<string, readonly (AdresseGeocodee | null)[]>>

export type ReprendreLAdresse = (
  lieuId: string,
  adresse: AdresseGeocodee,
) => Promise<void>

export type SupprimerLeLieu = (lieuId: string) => Promise<void>

/**
 * Ce que la Base Adresse Nationale a répondu sur l'ensemble des lieux : par
 * l'adresse d'abord, puis par les coordonnées pour ceux que l'adresse n'a pas
 * suffi à situer.
 */
export type AdressesRendues = {
  readonly parLAdresse: ReadonlyMap<string, readonly AdresseGeocodee[]>
  readonly parLesCoordonnees: ReadonlyMap<string, AdresseRetrouvee>
  readonly parLAnnuaire: ReadonlyMap<
    string,
    readonly (AdresseGeocodee | null)[]
  >
}

const cellule = (aReprendre: AdresseAReprendre): string => {
  if (
    aReprendre.verdict === 'a-corriger' ||
    aReprendre.verdict === 'a-corriger-d-apres-l-annuaire'
  )
    return A_CORRIGER
  if (aReprendre.verdict === 'a-supprimer')
    return `${A_SUPPRIMER} : ${aReprendre.motif}`

  return `à vérifier : ${aReprendre.motif}`
}

const motif = (aReprendre: AdresseAReprendre): string => {
  if (aReprendre.verdict === 'a-corriger') return `${COLONNE} : ${A_CORRIGER}`
  if (aReprendre.verdict === 'a-corriger-d-apres-l-annuaire')
    return `${COLONNE} : ${A_CORRIGER} ${D_APRES_L_ANNUAIRE}`
  if (aReprendre.verdict === 'a-supprimer')
    return `${COLONNE} : ${A_SUPPRIMER}, ${aReprendre.motif}`

  return `${COLONNE} : ${aReprendre.motif}`
}

const appliquer =
  (reprendreLAdresse: ReprendreLAdresse, supprimerLeLieu: SupprimerLeLieu) =>
  async (lieuId: string, aReprendre: AdresseAReprendre): Promise<void> => {
    if (aReprendre.verdict === 'a-verifier') return
    if (aReprendre.verdict === 'a-supprimer') {
      await supprimerLeLieu(lieuId)

      return
    }

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
    consulterLAnnuaire: ConsulterLAnnuaire,
  ) =>
  async (lieux: readonly LieuAReprendre[]): Promise<AdressesRendues> => {
    const parLAdresse = await geocoderLesAdresses(lieux.map(adresseSoumise))

    const aRetrouver = lieux.filter(
      (lieu) => adresseDeLAdresse(lieu, parLAdresse.get(lieu.id) ?? []) == null,
    )

    const parLesCoordonnees = await retrouverParLesCoordonnees(
      aRetrouver.flatMap(coordonneesSoumises),
    )

    const introuvables = aRetrouver.filter(
      (lieu) =>
        adresseDesCoordonnees(lieu, parLesCoordonnees.get(lieu.id)) == null,
    )

    return {
      parLAdresse,
      parLesCoordonnees,
      parLAnnuaire: await consulterLAnnuaire(
        introuvables.flatMap(serviceDemande),
      ),
    }
  }

export const repriseDeLAdresse = (
  geocoderLesAdresses: GeocoderLesAdresses,
  retrouverParLesCoordonnees: RetrouverParLesCoordonnees,
  consulterLAnnuaire: ConsulterLAnnuaire,
  reprendreLAdresse: ReprendreLAdresse,
  supprimerLeLieu: SupprimerLeLieu,
): Reprise =>
  repriseAvecPrealable<AdresseAReprendre, AdressesRendues>({
    colonnes: [COLONNE],
    preparer: adressesRendues(
      geocoderLesAdresses,
      retrouverParLesCoordonnees,
      consulterLAnnuaire,
    ),
    constater: (lieu, { parLAdresse, parLesCoordonnees, parLAnnuaire }) =>
      adresseAReprendre(
        lieu,
        parLAdresse.get(lieu.id) ?? [],
        parLesCoordonnees.get(lieu.id),
        parLAnnuaire.get(lieu.id) ?? [],
      ),
    mentions: (aReprendre) => [
      {
        colonne: COLONNE,
        cellule: cellule(aReprendre),
        motif: motif(aReprendre),
      },
    ],
    appliquer: appliquer(reprendreLAdresse, supprimerLeLieu),
  })
