import { type Feature, searchAdresse } from '@/configuration/ban/apiAdresse'
import { banFeatureToAdresseBanData } from '@/external-apis/ban/banFeatureToAdresseBanData'

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

export const communeFieldsFromAddress = async (
  adresse: string,
): Promise<CommuneFields | null> =>
  communeDuResultat(await searchAdresse(adresse))
