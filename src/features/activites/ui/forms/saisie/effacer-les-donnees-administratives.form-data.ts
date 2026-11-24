import {
  AIDE_AUX_DEMARCHES_ADMINISTRATIVES,
  type Thematique,
  thematiquesNonAdministrativesValues,
} from '@/features/activites/ui/labels/libelles/thematique.labels'

const hasAideAuxDemarchesAdministratives = (thematiques: Thematique[]) =>
  thematiques.includes(AIDE_AUX_DEMARCHES_ADMINISTRATIVES)

const onlyNonAdministrativesThematiques = (thematique: Thematique) =>
  thematiquesNonAdministrativesValues.some((valeur) => valeur === thematique)

export const effacerLesDonneesAdministratives = <T>(
  data: T & {
    thematiques: Thematique[]
    precisionsDemarche?: string | null | undefined
  },
) => {
  const { precisionsDemarche, ...rest } = data

  return {
    ...rest,
    thematiques: hasAideAuxDemarchesAdministratives(data.thematiques)
      ? data.thematiques
      : data.thematiques.filter(onlyNonAdministrativesThematiques),
    precisionsDemarche: hasAideAuxDemarchesAdministratives(data.thematiques)
      ? precisionsDemarche
      : null,
  }
}
