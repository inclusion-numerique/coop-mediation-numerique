export const SelectAllHeaderCell = ({
  checked,
  indeterminate,
  onToggle,
}: {
  checked: boolean
  indeterminate: boolean
  onToggle: () => void
}) => (
  <th
    scope="col"
    className="fr-checkbox-group fr-checkbox-group--sm fr-pb-6v"
    style={{ width: 20 }}
  >
    <input
      type="checkbox"
      id="select-all-rows"
      checked={checked}
      onChange={onToggle}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate
      }}
    />
    <label className="fr-label" htmlFor="select-all-rows">
      <span className="fr-sr-only">Tout sélectionner</span>
    </label>
  </th>
)
