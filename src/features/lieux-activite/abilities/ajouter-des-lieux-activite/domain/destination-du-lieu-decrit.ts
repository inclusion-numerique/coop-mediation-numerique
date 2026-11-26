import { type Result, success } from '@/libraries/result'
import type { DestinationDuLieu } from '../../../domain/destination-du-lieu'
import type { LieuAMaterialiser } from '../../../domain/lieu-identite'
import {
  AUCUN_LIEU_PREVU,
  reconnaitreLeLieu,
} from '../../../domain/reconnaitre-le-lieu'
import type { DestinationDuLieuDecritPorts } from './ports'

export const destinationDuLieuDecrit =
  ({
    lieuxAuMemeEndroit,
    nouvelIdentifiantDeLieu,
  }: DestinationDuLieuDecritPorts) =>
  async <Lieu extends LieuAMaterialiser>({
    lieu,
  }: {
    readonly lieu: Lieu
  }): Promise<Result<DestinationDuLieu<Lieu>, never>> =>
    success(
      (await reconnaitreLeLieu(lieuxAuMemeEndroit)({
        aReconnaitre: lieu,
        prevus: AUCUN_LIEU_PREVU,
      })) ?? {
        _tag: 'LieuACreer',
        id: nouvelIdentifiantDeLieu(),
        creation: lieu,
      },
    )
