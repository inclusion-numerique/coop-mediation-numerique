export type StatutCartographie =
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
}): StatutCartographie =>
  structureCartographieNationaleId == null
    ? 'pending'
    : hasRecentModification
      ? 'updating'
      : 'visible'

export const statutCartographie = ({
  visiblePourCartographieNationale,
  structureCartographieNationaleId,
  hasRecentModification = false,
}: {
  visiblePourCartographieNationale: boolean
  structureCartographieNationaleId: string | null
  hasRecentModification?: boolean
}): StatutCartographie =>
  visiblePourCartographieNationale
    ? statutDUnLieuVisible({
        structureCartographieNationaleId,
        hasRecentModification,
      })
    : 'not_visible'
