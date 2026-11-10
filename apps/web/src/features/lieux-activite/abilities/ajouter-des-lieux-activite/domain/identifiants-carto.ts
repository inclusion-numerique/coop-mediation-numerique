import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import type { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'

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
