export const SelectRowCell = ({
  id,
  checked,
  label,
  onToggle,
}: {
  id: string
  checked: boolean
  label: string
  onToggle: () => void
}) => (
  <td
    className="fr-checkbox-group fr-checkbox-group--sm fr-pb-8v"
    style={{ position: 'relative', zIndex: 2, width: 20 }}
    onClick={(event) => event.stopPropagation()}
  >
    <input
      type="checkbox"
      id={`select-row-${id}`}
      checked={checked}
      onChange={onToggle}
    />
    <label className="fr-label" htmlFor={`select-row-${id}`}>
      <span className="fr-sr-only">Sélectionner {label}</span>
    </label>
  </td>
)
