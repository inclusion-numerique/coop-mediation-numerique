import { nombreDeLieuxDuDepartement } from '@app/web/features/lieux-activite'
import { Effectif } from '../../../../domain'
import type { CompterLesLieuxDuDepartement } from '../../domain'

export const compterLesLieuxDuDepartement: CompterLesLieuxDuDepartement =
  async (departement) => Effectif(await nombreDeLieuxDuDepartement(departement))
