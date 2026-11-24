import type { AdresseBanData } from '@/libraries/adresse/adresse-ban-validation'
import { type Feature, searchAdresses } from '@/libraries/ban/api-adresse'
import { banFeatureToAdresseBanData } from '@/libraries/ban/ban-feature-to-adresse-ban-data'

/**
 * Les seuls champs nécessaires au géocodage : structures employeuses et lieux
 * d'activité les portent tous deux, d'où cette forme minimale plutôt qu'un type
 * de résultat de recherche particulier.
 */
export type AdresseAGeocoder = {
  readonly adresse: string
  readonly codePostal: string
  readonly commune: string
  readonly codeInsee: string | null
}

// Un résultat de type « municipality » est un repli sur le centre de la
// commune : la voie n’a pas été trouvée, on le considère comme un échec.
const isPreciseMatchIn =
  (codeInsee: string) =>
  ({ properties }: Feature): boolean =>
    properties.citycode === codeInsee && properties.type !== 'municipality'

export const geocoderPrecisement = async (
  structure: AdresseAGeocoder,
): Promise<AdresseBanData | null> => {
  if (!structure.codeInsee) return null

  const banFeatures = await searchAdresses(
    `${structure.adresse} ${structure.codePostal} ${structure.commune}`,
    { limit: 1, autocomplete: false, citycode: structure.codeInsee },
  )
  const banFeature = banFeatures
    .filter(isPreciseMatchIn(structure.codeInsee))
    .at(0)

  return banFeature ? banFeatureToAdresseBanData(banFeature) : null
}
