import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'

export type RdvBeneficiaireCommuneFields = {
  commune: string
  communeCodePostal: string
  communeCodeInsee: string
}

export const communeFieldsFromRdvAddress = async (
  address: string | null | undefined,
): Promise<RdvBeneficiaireCommuneFields | null> => {
  if (!address) return null

  const feature = await searchAdresse(address)
  if (!feature) return null

  const { commune, codePostal, codeInsee } = banFeatureToAdresseBanData(feature)
  if (!commune || !codePostal || !codeInsee) return null

  return {
    commune,
    communeCodePostal: codePostal,
    communeCodeInsee: codeInsee,
  }
}
