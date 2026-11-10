import { thematiquesNonAdministrativesValues } from '@app/web/features/activites/use-cases/cra/fields/thematique'
import { Thematique } from '@app/web/generated/prisma/browser'

const hasAideAuxDemarchesAdministratives = (thematiques: Thematique[]) =>
  thematiques.includes(Thematique.AideAuxDemarchesAdministratives)

const onlyNonAdministrativesThematiques = (thematique: Thematique) =>
  thematiquesNonAdministrativesValues.includes(thematique)

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
