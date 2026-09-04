import { coopCartographieNationaleSource } from '@app/web/libraries/cartographie-nationale'
import type { LieuCarto } from './identifiant-composite'

/**
 * Une modification venue d'ailleurs se trace, et seulement elle.
 *
 * Deux conditions, cumulatives : la cartographie tient la fiche d'une source
 * qui n'est pas la coop — sinon nous nous attribuerions nos propres écritures —
 * et cette source a touché la fiche après nous. Une modification carto plus
 * ancienne que la nôtre ne dit rien de neuf.
 *
 * Tracer la source efface l'auteur coop : c'est le propos, la dernière main
 * n'est plus la nôtre.
 */
export const modificationExterne = (
  lieu: LieuCarto,
  derniereModificationCoop: Date,
): {
  readonly derniereModificationSource: string
  readonly derniereModificationParId: null
} | null => {
  if (lieu.source == null || lieu.source === coopCartographieNationaleSource) {
    return null
  }

  if (lieu.dateMaj == null || lieu.dateMaj <= derniereModificationCoop) {
    return null
  }

  return {
    derniereModificationSource: lieu.source,
    derniereModificationParId: null,
  }
}
