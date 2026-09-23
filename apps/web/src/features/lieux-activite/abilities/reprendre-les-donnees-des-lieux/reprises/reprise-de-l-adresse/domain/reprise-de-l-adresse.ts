import {
  type LieuAReprendre,
  type Reprise,
  repriseAvecPrealable,
} from '../../../domain'
import {
  type AdresseAReprendre,
  type AdresseConsignee,
  type AdresseGeocodee,
  type AdresseRetrouvee,
  type AdresseSoumise,
  adresseAReprendre,
  adresseDeLAdresse,
  adresseDesCoordonnees,
  adresseDuRegistre,
  adresseSoumise,
  type CoordonneesSoumises,
  confieeAuLieuSiInactif,
  coordonneesSoumises,
  type ServiceDemande,
  serviceDemande,
} from './adresse-a-reprendre'

const COLONNE = 'adresse'

const A_CORRIGER = 'à corriger'

const A_SUPPRIMER = 'à supprimer'

const A_FAIRE_CORRIGER = 'à faire corriger par le lieu'

const D_APRES_L_ANNUAIRE = "d'après l'Annuaire de l'administration"

const D_APRES_LE_REGISTRE = "d'après le registre des adresses consignées"

export type GeocoderLesAdresses = (
  adresses: readonly AdresseSoumise[],
) => Promise<ReadonlyMap<string, readonly AdresseGeocodee[]>>

export type RetrouverParLesCoordonnees = (
  coordonnees: readonly CoordonneesSoumises[],
) => Promise<ReadonlyMap<string, AdresseRetrouvee>>

export type SituerLesAdressesConsignees = (
  lieuIds: readonly string[],
) => Promise<ReadonlyMap<string, AdresseConsignee>>

export type ConsulterLAnnuaire = (
  demandes: readonly ServiceDemande[],
) => Promise<ReadonlyMap<string, readonly (AdresseGeocodee | null)[]>>

export type ReprendreLAdresse = (
  lieuId: string,
  adresse: AdresseGeocodee,
) => Promise<void>

export type SupprimerLeLieu = (lieuId: string) => Promise<void>

export type ConfierLAdresseAuLieu = (lieuId: string) => Promise<void>

/**
 * Ce que la Base Adresse Nationale a répondu sur l'ensemble des lieux : par
 * l'adresse d'abord, puis par les coordonnées pour ceux que l'adresse n'a pas
 * suffi à situer.
 */
export type AdressesRendues = {
  readonly parLAdresse: ReadonlyMap<string, readonly AdresseGeocodee[]>
  readonly parLesCoordonnees: ReadonlyMap<string, AdresseRetrouvee>
  readonly parLeRegistre: ReadonlyMap<string, AdresseConsignee>
  readonly parLAnnuaire: ReadonlyMap<
    string,
    readonly (AdresseGeocodee | null)[]
  >
}

const cellule = (aReprendre: AdresseAReprendre): string => {
  if (
    aReprendre.verdict === 'a-corriger' ||
    aReprendre.verdict === 'a-corriger-d-apres-le-registre' ||
    aReprendre.verdict === 'a-corriger-d-apres-l-annuaire'
  )
    return A_CORRIGER
  if (aReprendre.verdict === 'a-supprimer')
    return `${A_SUPPRIMER} : ${aReprendre.motif}`
  if (aReprendre.verdict === 'a-faire-corriger')
    return `${A_FAIRE_CORRIGER} : ${aReprendre.motif}`

  return `à vérifier : ${aReprendre.motif}`
}

const motif = (aReprendre: AdresseAReprendre): string => {
  if (aReprendre.verdict === 'a-corriger') return `${COLONNE} : ${A_CORRIGER}`
  if (aReprendre.verdict === 'a-corriger-d-apres-le-registre')
    return `${COLONNE} : ${A_CORRIGER} ${D_APRES_LE_REGISTRE}`
  if (aReprendre.verdict === 'a-corriger-d-apres-l-annuaire')
    return `${COLONNE} : ${A_CORRIGER} ${D_APRES_L_ANNUAIRE}`
  if (aReprendre.verdict === 'a-supprimer')
    return `${COLONNE} : ${A_SUPPRIMER}, ${aReprendre.motif}`
  if (aReprendre.verdict === 'a-faire-corriger')
    return `${COLONNE} : ${A_FAIRE_CORRIGER}`

  return `${COLONNE} : ${aReprendre.motif}`
}

const appliquer =
  (
    reprendreLAdresse: ReprendreLAdresse,
    supprimerLeLieu: SupprimerLeLieu,
    confierLAdresseAuLieu: ConfierLAdresseAuLieu,
  ) =>
  async (lieuId: string, aReprendre: AdresseAReprendre): Promise<void> => {
    if (aReprendre.verdict === 'a-verifier') return
    if (aReprendre.verdict === 'a-faire-corriger') {
      await confierLAdresseAuLieu(lieuId)

      return
    }
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
    situerLesAdressesConsignees: SituerLesAdressesConsignees,
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

    const parLeRegistre = await situerLesAdressesConsignees(
      introuvables.map(({ id }) => id),
    )

    const horsDuRegistre = introuvables.filter(
      (lieu) => adresseDuRegistre(parLeRegistre.get(lieu.id)) == null,
    )

    return {
      parLAdresse,
      parLesCoordonnees,
      parLeRegistre,
      parLAnnuaire: await consulterLAnnuaire(
        horsDuRegistre.flatMap(serviceDemande),
      ),
    }
  }

export const repriseDeLAdresse = (
  geocoderLesAdresses: GeocoderLesAdresses,
  retrouverParLesCoordonnees: RetrouverParLesCoordonnees,
  situerLesAdressesConsignees: SituerLesAdressesConsignees,
  consulterLAnnuaire: ConsulterLAnnuaire,
  reprendreLAdresse: ReprendreLAdresse,
  supprimerLeLieu: SupprimerLeLieu,
  confierLAdresseAuLieu: ConfierLAdresseAuLieu,
  maintenant: Date,
): Reprise =>
  repriseAvecPrealable<AdresseAReprendre, AdressesRendues>({
    colonnes: [COLONNE],
    preparer: adressesRendues(
      geocoderLesAdresses,
      retrouverParLesCoordonnees,
      situerLesAdressesConsignees,
      consulterLAnnuaire,
    ),
    constater: (
      lieu,
      { parLAdresse, parLesCoordonnees, parLeRegistre, parLAnnuaire },
    ) =>
      confieeAuLieuSiInactif(
        lieu,
        adresseAReprendre(
          lieu,
          parLAdresse.get(lieu.id) ?? [],
          parLesCoordonnees.get(lieu.id),
          parLAnnuaire.get(lieu.id) ?? [],
          parLeRegistre.get(lieu.id),
        ),
        maintenant,
      ),
    mentions: (aReprendre) => [
      {
        colonne: COLONNE,
        cellule: cellule(aReprendre),
        motif: motif(aReprendre),
      },
    ],
    appliquer: appliquer(
      reprendreLAdresse,
      supprimerLeLieu,
      confierLAdresseAuLieu,
    ),
  })
