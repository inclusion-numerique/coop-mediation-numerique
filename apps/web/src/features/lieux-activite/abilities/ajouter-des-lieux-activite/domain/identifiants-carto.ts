import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import type { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'

/**
 * Les identités de cartographie nationale que ces lieux portent.
 *
 * La plupart n'en ont pas : c'est une annotation tardive, posée par le job de
 * synchronisation sur un lieu déjà créé. La propriété est donc facultative ET
 * nullable, selon d'où vient le lieu — la même règle vaut pour un lieu demandé
 * comme pour un lieu déjà rattaché.
 */
export const identifiantsCarto = (
  lieux: readonly {
    readonly structureCartographieNationaleId?: IdentifiantCartographie | null
  }[],
): readonly IdentifiantCartographie[] =>
  lieux
    .map(
      ({ structureCartographieNationaleId }) =>
        structureCartographieNationaleId,
    )
    .filter(onlyDefinedAndNotNull)
