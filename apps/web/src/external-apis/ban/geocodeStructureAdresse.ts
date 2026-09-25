import { type Feature, searchAdresses } from '@app/web/external-apis/apiAdresse'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'

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

export const SANS_SIRET_A_LA_MAIN =
  'Merci de sélectionner « Il n’y a pas de SIRET pour ce lieu » et de renseigner l’adresse à la main.'

export const CREER_A_LA_MAIN =
  'Merci de choisir « Créer un lieu d’activité » et de renseigner l’adresse à la main.'

export const adresseNonVerifiableMessage = (
  { adresse, codePostal, commune }: AdresseAGeocoder,
  consigne: string,
): string =>
  `L’adresse « ${adresse} ${codePostal} ${commune} » de cet établissement est introuvable dans la Base Adresse Nationale. ${consigne}`

// Un résultat de type « municipality » est un repli sur le centre de la
// commune : la voie n’a pas été trouvée, on le considère comme un échec.
const isPreciseMatchIn =
  (codeInsee: string) =>
  ({ properties }: Feature): boolean =>
    properties.citycode === codeInsee && properties.type !== 'municipality'

export const geocodeStructureAdresse = async (
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
