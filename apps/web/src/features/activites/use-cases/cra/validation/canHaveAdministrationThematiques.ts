import { Thematique } from '@app/web/generated/prisma/browser'
import {
  thematiquesNonAdministrativesLabels,
  thematiquesNonAdministrativesValues,
} from '../fields/thematique'

export const cannotHaveAdministrationThematiquesMessage = `Les thématiques administratives ne sont autorisées que si la thématique "${thematiquesNonAdministrativesLabels.AideAuxDemarchesAdministratives}" est sélectionnée`

export const canHaveAdministationThematiques = ({
  thematiques,
}: {
  thematiques: Thematique[]
}) =>
  thematiques.includes(Thematique.AideAuxDemarchesAdministratives) ||
  thematiques.every((thematique) =>
    thematiquesNonAdministrativesValues.includes(thematique),
  )
