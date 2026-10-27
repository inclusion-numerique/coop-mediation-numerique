import {
  type ChangeObjectKeysCaseRecursive,
  changeObjectKeysCaseRecursive,
} from '@app/web/utils/changeObjectKeysCaseRecursive'
import type { StatistiquesExposees } from '../prisma/statistiques-exposees.query'

export type StatistiquesAttributes = ChangeObjectKeysCaseRecursive<
  StatistiquesExposees,
  'snake'
>

export const statistiquesAttributes = (
  statistiques: StatistiquesExposees,
): StatistiquesAttributes =>
  changeObjectKeysCaseRecursive(statistiques, 'snake')
