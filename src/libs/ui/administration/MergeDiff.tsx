const AdditionDiff = ({ diff }: { diff: number }) =>
  diff === 0 ? null : (
    <span className="fr-text--bold fr-text-label--green-bourgeon fr-mb-0">
      &nbsp;
      <span className="ri-add-line" aria-hidden />
      {diff}
    </span>
  )

const SubtractionDiff = ({ sourceIds }: { sourceIds: readonly string[] }) =>
  sourceIds.length === 0 ? null : (
    <span className="fr-text--bold fr-text-label--red-marianne fr-mb-0">
      &nbsp;
      <span className="ri-subtract-line" aria-hidden />
      {sourceIds.length}
    </span>
  )

export const MergeDiff = ({
  isAddition = true,
  sourceIds,
  commonIds,
}: {
  isAddition?: boolean
  // Seule la taille compte : n'importe quelle liste de valeurs comparables fait
  // l'affaire, y compris une liste d'identifiants marqués.
  sourceIds: readonly string[]
  commonIds: readonly string[]
}) =>
  isAddition ? (
    <AdditionDiff diff={(sourceIds.length ?? 0) - (commonIds.length ?? 0)} />
  ) : (
    <SubtractionDiff sourceIds={sourceIds} />
  )
