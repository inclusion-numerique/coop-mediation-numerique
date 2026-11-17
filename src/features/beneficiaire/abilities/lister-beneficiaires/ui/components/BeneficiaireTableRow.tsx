import { SelectRowCell } from '@app/web/libraries/data-table'
import classNames from 'classnames'
import Link from 'next/link'
import type { BeneficiaireRow } from './beneficiaire-row'
import { beneficiairesColumns } from './beneficiaires-columns'

export const BeneficiaireTableRow = ({
  row,
  selected,
  onToggle,
}: {
  row: BeneficiaireRow
  selected: boolean
  onToggle: (id: string) => void
}) => (
  <tr className={classNames('fr-enlarge-link', 'fr-table-row--link')}>
    <SelectRowCell
      id={row.id}
      checked={selected}
      label={row.label}
      onToggle={() => onToggle(row.id)}
    />
    {beneficiairesColumns.map((column) => (
      <td
        key={column.tri}
        className={classNames(
          'fr-cell--data',
          column.alignRight && 'fr-text--right',
        )}
      >
        {row[column.field]}
      </td>
    ))}
    <td className="fr-p-0">
      <Link href={row.href}>
        <span className="fr-sr-only">Voir la fiche de {row.label}</span>
      </Link>
    </td>
  </tr>
)
