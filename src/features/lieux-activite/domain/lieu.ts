import type { BanId } from './ban-id'
import type { Fiche } from './fiche'
import type { IdentiteSirene } from './identite-sirene'
import type { IdsCartographieNationale } from './ids-cartographie-nationale'
import type { LieuId } from './lieu-id'
import type { Tracabilite } from './tracabilite'
import type { VisibiliteCartographie } from './visibilite-cartographie'

export type Lieu = {
  readonly id: LieuId
  readonly fiche: Fiche
  readonly visibilite: VisibiliteCartographie
  readonly idsCartographieNationale: IdsCartographieNationale | null
  readonly banId: BanId | null
  readonly identiteSirene: IdentiteSirene
  readonly tracabilite: Tracabilite
}
