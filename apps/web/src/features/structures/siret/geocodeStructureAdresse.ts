import { type Feature, searchAdresses } from '@app/web/external-apis/apiAdresse'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import type { StructureSearchResult } from '@app/web/features/inscription/use-cases/renseigner-structure-employeuse/searchStructureEmployeuseCombined'

export const adresseNonVerifiableMessage = ({
  adresse,
  codePostal,
  commune,
}: StructureSearchResult): string =>
  `L’adresse « ${adresse} ${codePostal} ${commune} » de cet établissement est introuvable dans la Base Adresse Nationale. Contactez le support pour ajouter ce lieu.`

// Un résultat de type « municipality » est un repli sur le centre de la
// commune : la voie n’a pas été trouvée, on le considère comme un échec.
const isPreciseMatchIn =
  (codeInsee: string) =>
  ({ properties }: Feature): boolean =>
    properties.citycode === codeInsee && properties.type !== 'municipality'

export const geocodeStructureAdresse = async (
  structure: StructureSearchResult,
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
