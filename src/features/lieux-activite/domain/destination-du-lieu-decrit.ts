import { type Result, success } from '@/libraries/result'
import type { DestinationDuLieu } from './destination-du-lieu'
import { type LieuDecrit, lieuAMaterialiserDuLieuDecrit } from './lieu-decrit'
import type { DestinationDuLieuDecritPorts } from './ports'
import { AUCUN_LIEU_PREVU, reconnaitreLeLieu } from './reconnaitre-le-lieu'

export const destinationDuLieuDecrit =
  ({
    lieuxAuMemeEndroit,
    nouvelIdentifiantDeLieu,
  }: DestinationDuLieuDecritPorts) =>
  async <Lieu extends LieuDecrit>({
    lieu,
  }: {
    readonly lieu: Lieu
  }): Promise<Result<DestinationDuLieu<Lieu>, never>> =>
    success(
      (await reconnaitreLeLieu(lieuxAuMemeEndroit)({
        aReconnaitre: lieuAMaterialiserDuLieuDecrit(lieu),
        prevus: AUCUN_LIEU_PREVU,
      })) ?? {
        _tag: 'LieuACreer',
        id: nouvelIdentifiantDeLieu(),
        creation: lieu,
      },
    )
