import {
  thematiqueAdministrativesOptions,
  thematiqueNonAdministrativesOptions,
} from './thematique'
import { typeActiviteSlugOptions } from './type-activite'

const AIDE_AUX_DEMARCHES = 'AideAuxDemarchesAdministratives'

export const vocabulaireDesActivites = {
  typesDActivite: typeActiviteSlugOptions,
  thematiquesDeMediation: thematiqueNonAdministrativesOptions.filter(
    ({ value }) => value !== AIDE_AUX_DEMARCHES,
  ),
  thematiquesAdministratives: thematiqueAdministrativesOptions,
  toutesLesThematiques: [
    ...thematiqueNonAdministrativesOptions,
    ...thematiqueAdministrativesOptions,
  ],
}
