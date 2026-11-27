import {
  Endroit,
  type LieuCandidatCoop,
  type LieuConnu,
} from './destination-du-lieu'
import type { LieuId } from './identifiants/lieu-id'
import { correler, type LieuAMaterialiser } from './lieu-identite'
import type { LieuxAuMemeEndroit } from './ports'

export type LieuxPrevus = {
  readonly crees: readonly LieuCandidatCoop[]
  readonly releves: readonly LieuId[]
}

export const AUCUN_LIEU_PREVU: LieuxPrevus = { crees: [], releves: [] }

export const endroitDe = ({
  codeInsee,
  codePostal,
}: LieuAMaterialiser): Endroit | null =>
  codeInsee ? Endroit({ codeInsee, codePostal }) : null

const auMemeEndroit =
  (endroit: Endroit) =>
  ({ codeInsee, codePostal }: LieuCandidatCoop): boolean =>
    codeInsee === endroit.codeInsee || codePostal === endroit.codePostal

const tenantCompteDesPrevus = (
  candidats: readonly LieuCandidatCoop[],
  prevus: LieuxPrevus,
  endroit: Endroit,
): readonly LieuCandidatCoop[] => [
  ...candidats.map((candidat) =>
    prevus.releves.includes(candidat.id)
      ? { ...candidat, suppression: null }
      : candidat,
  ),
  ...prevus.crees.filter(auMemeEndroit(endroit)),
]

const estPrevu = (prevus: LieuxPrevus, id: LieuId): boolean =>
  prevus.releves.includes(id) || prevus.crees.some((cree) => cree.id === id)

export const reconnaitreLeLieu =
  (lieuxAuMemeEndroit: LieuxAuMemeEndroit) =>
  async ({
    aReconnaitre,
    prevus,
  }: {
    readonly aReconnaitre: LieuAMaterialiser
    readonly prevus: LieuxPrevus
  }): Promise<LieuConnu | null> => {
    const endroit = endroitDe(aReconnaitre)

    if (endroit === null) return null

    const correle = correler(
      tenantCompteDesPrevus(await lieuxAuMemeEndroit(endroit), prevus, endroit),
      aReconnaitre,
    )

    if (correle === null) return null

    if (correle.suppression === null)
      return {
        _tag: estPrevu(prevus, correle.id) ? 'LieuPrevu' : 'LieuActif',
        id: correle.id,
      }

    return correle.forte ? { _tag: 'LieuARelever', id: correle.id } : null
  }
