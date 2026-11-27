import { type Result, success } from '@/libraries/result'
import type { CoordinateurId } from '../../../domain'
import {
  type ActivitesDeCoordination,
  decompterParTrimestre,
} from './activites-de-coordination'
import type { CompterLesActivitesDeCoordinationPorts } from './ports'

export const compterLesActivitesDeCoordination =
  ({ activitesDuCoordinateur }: CompterLesActivitesDeCoordinationPorts) =>
  async ({
    coordinateurId,
  }: {
    readonly coordinateurId: CoordinateurId
  }): Promise<Result<ActivitesDeCoordination, never>> =>
    success(
      decompterParTrimestre(await activitesDuCoordinateur(coordinateurId)),
    )
