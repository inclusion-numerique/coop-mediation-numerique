import {
  thematiqueAdministrativesOptions,
  thematiqueNonAdministrativesOptions,
} from './thematique.labels'
import { typeActiviteSlugOptions } from './type-activite.labels'

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
