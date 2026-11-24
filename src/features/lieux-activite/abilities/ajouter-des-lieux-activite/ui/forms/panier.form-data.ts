import type { SuggestionAffichee } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/presenters/suggestion-de-lieu.presenter'
import {
  adresseNonVerifiableMessage,
  CREER_A_LA_MAIN,
} from '@/features/lieux-activite/ui/labels/adresse-non-verifiable.labels'
import type { AdresseBanData } from '@/libraries/adresse/adresse-ban-validation'
import {
  SERVICE_ADRESSE_INDISPONIBLE,
  siIndisponible,
} from '@/libraries/ban/api-adresse'
import { type geocoderPrecisement } from '@/libraries/ban/geocoder-precisement'
import { failure, type Result, success } from '@/libraries/result'
import type { LieuxAAjouterData } from '../../action/ajouter-des-lieux-activite.validation'

export type LieuAuPanier = LieuxAAjouterData['lieux'][number]

export type GeocoderUnLieu = typeof geocoderPrecisement

export const auPanier =
  (geocoder: GeocoderUnLieu) =>
  async (resultat: SuggestionAffichee): Promise<LieuAuPanier | null> => {
    const lieuCoop = resultat.structures.at(0)

    if (lieuCoop)
      return {
        id: lieuCoop.id,
        structureCartographieNationaleId: null,
        nom: resultat.nom,
        siret: null,
        adresse: resultat.adresse,
        commune: resultat.commune,
        codePostal: resultat.codePostal,
        codeInsee: resultat.codeInsee,
      }

    const adresseBan = await geocoder(resultat)

    if (!adresseBan) return null

    return {
      id: null,
      structureCartographieNationaleId:
        resultat.source === 'cartographie_nationale' ? resultat.id : null,
      nom: resultat.nom,
      siret: resultat.source === 'api' ? (resultat.pivot ?? null) : null,
      adresse: adresseBan.nom,
      commune: adresseBan.commune,
      codePostal: adresseBan.codePostal,
      codeInsee: adresseBan.codeInsee,
      banId: adresseBan.id,
      latitude: adresseBan.latitude,
      longitude: adresseBan.longitude,
    }
  }

export const memeLieu = (un: LieuAuPanier, autre: LieuAuPanier): boolean => {
  if (un.id != null && autre.id != null) return un.id === autre.id

  if (
    un.structureCartographieNationaleId != null &&
    autre.structureCartographieNationaleId != null
  )
    return (
      un.structureCartographieNationaleId ===
      autre.structureCartographieNationaleId
    )

  return (
    un.nom === autre.nom &&
    un.adresse === autre.adresse &&
    un.codePostal === autre.codePostal
  )
}

export const selectionner =
  (geocoder: GeocoderUnLieu) =>
  async (
    lieux: readonly LieuAuPanier[],
    resultat: SuggestionAffichee,
  ): Promise<Result<LieuAuPanier, string>> => {
    const lieu = await auPanier(geocoder)(resultat).catch(
      siIndisponible('indisponible' as const),
    )

    if (lieu === 'indisponible') return failure(SERVICE_ADRESSE_INDISPONIBLE)

    if (lieu == null)
      return failure(adresseNonVerifiableMessage(resultat, CREER_A_LA_MAIN))

    return lieux.some((present) => memeLieu(present, lieu))
      ? failure(`${lieu.nom} fait déjà partie de votre sélection.`)
      : success(lieu)
  }

export const lieuCree = ({
  id,
  nom,
  adresseBan,
}: {
  id: string
  nom: string
  adresseBan: AdresseBanData
}): LieuAuPanier => ({
  id,
  structureCartographieNationaleId: null,
  nom,
  siret: null,
  adresse: adresseBan.nom,
  commune: adresseBan.commune,
  codePostal: adresseBan.codePostal,
  codeInsee: adresseBan.codeInsee,
  banId: adresseBan.id,
  latitude: adresseBan.latitude,
  longitude: adresseBan.longitude,
})
