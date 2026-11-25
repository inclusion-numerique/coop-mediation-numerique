import {
  banFeatureToAdresseBanData,
  type Feature,
  searchAdresse,
} from '@/libraries/ban'
import type { CommuneFields } from '../../domain/creer-ou-fusionner-depuis-usager-externe'

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
