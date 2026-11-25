import type { IdsCartographieNationale } from './cartographie-nationale/ids-cartographie-nationale'
import type { VisibiliteCartographie } from './cartographie-nationale/visibilite-cartographie'
import type { Fiche } from './fiche'
import type { BanId } from './identifiants/ban-id'
import type { LieuId } from './identifiants/lieu-id'
import type { IdentiteSirene } from './identite-sirene'
import type { Tracabilite } from './registre/tracabilite'

export type Lieu = {
  readonly id: LieuId
  readonly fiche: Fiche
  readonly visibilite: VisibiliteCartographie
  readonly idsCartographieNationale: IdsCartographieNationale | null
  readonly banId: BanId | null
  readonly identiteSirene: IdentiteSirene
  readonly tracabilite: Tracabilite
}
