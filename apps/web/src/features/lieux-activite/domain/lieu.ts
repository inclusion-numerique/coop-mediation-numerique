import type { BanId } from './ban-id'
import type { Fiche } from './fiche'
import type { IdentiteSirene } from './identite-sirene'
import type { IdsCartographieNationale } from './ids-cartographie-nationale'
import type { LieuId } from './lieu-id'
import type { Tracabilite } from './tracabilite'
import type { VisibiliteCartographie } from './visibilite-cartographie'

/**
 * Un lieu de médiation numérique : la fiche du schéma national, plus ce que la
 * coop sait en propre et que le standard ne transporte pas.
 *
 * Le lieu n'a **pas** de propriétaire. Le rattachement d'un médiateur est un
 * agrégat distinct (`Rattachement`) : la fiche est mutualisée, elle survit à
 * tous ses rattachements, et la déduplication comme la fusion administrative
 * la manipulent sans jamais regarder qui y exerce.
 */
export type Lieu = {
  readonly id: LieuId
  readonly fiche: Fiche
  readonly visibilite: VisibiliteCartographie
  readonly idsCartographieNationale: IdsCartographieNationale | null
  readonly banId: BanId | null
  readonly identiteSirene: IdentiteSirene
  readonly tracabilite: Tracabilite
}
