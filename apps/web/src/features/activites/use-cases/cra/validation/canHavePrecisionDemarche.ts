import { Thematique } from '@app/web/generated/prisma/browser'

export const cannotHavePrecisionDemarcheMessage =
  'La précision de la démarche ne peut être renseignée que si la thématique "Aides aux démarches administratives" est sélectionnée'

export const canHavePrecisionDemarche = ({
  thematiques,
  precisionsDemarche,
}: {
  thematiques: Thematique[]
  precisionsDemarche?: string | null
}) =>
  thematiques.includes(Thematique.AideAuxDemarchesAdministratives) ||
  precisionsDemarche == null ||
  precisionsDemarche === ''
