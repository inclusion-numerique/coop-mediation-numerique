import {
  AIDE_AUX_DEMARCHES_ADMINISTRATIVES,
  type Thematique,
  thematiquesNonAdministrativesValues,
} from '@app/web/features/activites/ui/libelles/thematique'

const hasAideAuxDemarchesAdministratives = (thematiques: Thematique[]) =>
  thematiques.includes(AIDE_AUX_DEMARCHES_ADMINISTRATIVES)

const onlyNonAdministrativesThematiques = (thematique: Thematique) =>
  thematiquesNonAdministrativesValues.some((valeur) => valeur === thematique)

export const clearAdministrativeData = <T>(
  data: T & {
    thematiques: Thematique[]
    precisionsDemarche?: string | null
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
