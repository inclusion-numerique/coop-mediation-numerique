import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'

export type RdvBeneficiaireCommuneFields = {
  commune: string
  communeCodePostal: string
  communeCodeInsee: string
}

/**
 * RDV Service Public only exposes a free-text address, never a structured
 * commune. Geocode it via the BAN to fill the commune / code postal / code INSEE
 * trio that the beneficiaire fiche needs to display "Commune de résidence".
 *
 * Returns null when there is no address, no geocoding match, or an incomplete
 * result (the trio must be complete to be usable).
 */
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
