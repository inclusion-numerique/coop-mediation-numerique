import { type Feature, searchAdresse } from '@/libraries/ban/api-adresse'
import { banFeatureToAdresseBanData } from '@/libraries/ban/ban-feature-to-adresse-ban-data'

export type CommuneFields = {
  commune: string
  communeCodePostal: string
  communeCodeInsee: string
}

export const communeDuResultat = (
  feature: Feature | null,
): CommuneFields | null => {
  if (!feature) return null

  const { commune, codePostal, codeInsee } = banFeatureToAdresseBanData(feature)
  if (!commune || !codePostal || !codeInsee) return null

  return {
    commune,
    communeCodePostal: codePostal,
    communeCodeInsee: codeInsee,
  }
}

export const champsDeCommuneDepuisLAdresse = async (
  adresse: string,
): Promise<CommuneFields | null> =>
  communeDuResultat(await searchAdresse(adresse))
