import { v4 } from 'uuid'
import type { Fiche } from '../../../domain/fiche'
import type { IdsCartographieNationale } from '../../../domain/ids-cartographie-nationale'
import type { Lieu } from '../../../domain/lieu'
import { LieuId } from '../../../domain/lieu-id'
import {
  ModificationInconnue,
  ModifieParSource,
  type SourceCartographie,
} from '../../../domain/tracabilite'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'

export type LieuCarto = {
  readonly idsCartographieNationale: IdsCartographieNationale
  readonly source: SourceCartographie | null
  readonly fiche: Fiche
}

const derniereModification = (
  source: SourceCartographie | null,
  maintenant: Date,
) =>
  source == null
    ? ModificationInconnue(maintenant)
    : ModifieParSource(maintenant, source)

export const lieuDepuisCarto = (
  { idsCartographieNationale, source, fiche }: LieuCarto,
  maintenant: Date,
): Lieu => ({
  id: LieuId(v4()),
  fiche,
  visibilite: VisibiliteCartographie('Publie'),
  idsCartographieNationale,
  banId: null,
  identiteSirene: { nomUsage: null, synchronisation: null },
  tracabilite: {
    creation: { date: maintenant, par: null },
    derniereModification: derniereModification(source, maintenant),
    suppression: { _tag: 'Actif' },
  },
})
