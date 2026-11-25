import type { IdsCartographieNationale } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { VisibiliteCartographie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import type { Fiche } from '../../../domain/fiche'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { Lieu } from '../../../domain/lieu'
import {
  ModificationInconnue,
  ModifieParSource,
  type SourceCartographie,
} from '../../../domain/registre/tracabilite'

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
  id: LieuId,
): Lieu => ({
  id,
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
