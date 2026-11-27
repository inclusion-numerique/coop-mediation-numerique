import type { IdsCartographieNationale } from '../cartographie-nationale/ids-cartographie-nationale'
import { VisibiliteCartographie } from '../cartographie-nationale/visibilite-cartographie'
import type { Fiche } from '../fiche'
import type { LieuId } from '../identifiants/lieu-id'
import type { Lieu } from '../lieu'
import {
  ModificationInconnue,
  ModifieParSource,
  type SourceCartographie,
} from '../registre/tracabilite'

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
