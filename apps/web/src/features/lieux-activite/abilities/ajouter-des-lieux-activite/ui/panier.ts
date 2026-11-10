import {
  SERVICE_ADRESSE_INDISPONIBLE,
  siIndisponible,
} from '@app/web/external-apis/apiAdresse'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import {
  adresseNonVerifiableMessage,
  CREER_A_LA_MAIN,
  geocodeStructureAdresse,
} from '@app/web/external-apis/ban/geocodeStructureAdresse'
import type { SuggestionAffichee } from '@app/web/features/lieux-activite/ui/suggestion-de-lieu.presenter'
import { failure, type Result, success } from '@app/web/libraries/result'
import type { LieuxAAjouterData } from '../action/ajouter-des-lieux-activite.validation'

export type LieuAuPanier = LieuxAAjouterData['lieux'][number]

export const auPanier = async (
  resultat: SuggestionAffichee,
): Promise<LieuAuPanier | null> => {
  const lieuCoop = resultat.structures.at(0)

  if (lieuCoop)
    return {
      id: lieuCoop.id,
      structureCartographieNationaleId: null,
      nom: resultat.nom,
      siret: resultat.pivot,
      adresse: resultat.adresse,
      commune: resultat.commune,
      codePostal: resultat.codePostal,
      codeInsee: resultat.codeInsee,
    }

  const adresseBan = await geocodeStructureAdresse(resultat)

  if (!adresseBan) return null

  return {
    id: null,
    structureCartographieNationaleId:
      resultat.source === 'cartographie_nationale' ? resultat.id : null,
    nom: resultat.nom,
    siret: resultat.pivot,
    adresse: adresseBan.nom,
    commune: adresseBan.commune,
    codePostal: adresseBan.codePostal,
    codeInsee: adresseBan.codeInsee,
    banId: adresseBan.id,
    latitude: adresseBan.latitude,
    longitude: adresseBan.longitude,
  }
}

export const memeLieu = (un: LieuAuPanier, autre: LieuAuPanier): boolean =>
  (un.id != null && un.id === autre.id) ||
  (un.structureCartographieNationaleId != null &&
    un.structureCartographieNationaleId ===
      autre.structureCartographieNationaleId)

export const selectionner = async (
  lieux: readonly LieuAuPanier[],
  resultat: SuggestionAffichee,
): Promise<Result<LieuAuPanier, string>> => {
  const lieu = await auPanier(resultat).catch(
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
