export type CartographyStatus =
  | 'visible'
  | 'pending'
  | 'updating'
  | 'not_visible'

const statutDUnLieuVisible = ({
  structureCartographieNationaleId,
  hasRecentModification,
}: {
  structureCartographieNationaleId: string | null
  hasRecentModification: boolean
}): CartographyStatus =>
  structureCartographieNationaleId == null
    ? 'pending'
    : hasRecentModification
      ? 'updating'
      : 'visible'

export const getCartographyStatus = ({
  visiblePourCartographieNationale,
  structureCartographieNationaleId,
  hasRecentModification = false,
}: {
  visiblePourCartographieNationale: boolean
  structureCartographieNationaleId: string | null
  hasRecentModification?: boolean
}): CartographyStatus =>
  visiblePourCartographieNationale
    ? statutDUnLieuVisible({
        structureCartographieNationaleId,
        hasRecentModification,
      })
    : 'not_visible'
