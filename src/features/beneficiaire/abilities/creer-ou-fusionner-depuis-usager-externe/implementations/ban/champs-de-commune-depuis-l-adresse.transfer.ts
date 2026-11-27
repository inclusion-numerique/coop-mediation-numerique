import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import {
  banFeatureToAdresseBanData,
  type Feature,
  searchAdresse,
} from '@/libraries/ban'

export const communeDuResultat = (
  feature: Feature | null,
): CommuneResidence | null => {
  if (!feature) return null

  const { commune, codePostal, codeInsee } = banFeatureToAdresseBanData(feature)
  return CommuneResidence.safe({ commune, codePostal, codeInsee })
}

export const champsDeCommuneDepuisLAdresse = async (
  adresse: string,
): Promise<CommuneResidence | null> =>
  communeDuResultat(await searchAdresse(adresse))
