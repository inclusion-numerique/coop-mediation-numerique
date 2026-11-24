import { onlyDefinedAndNotNull } from '@/libraries/collections/only-defined-and-not-null'
import type { IdentifiantCartographie } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'

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
