import { SelectRowCell } from '@app/web/libraries/data-table'
import classNames from 'classnames'
import Link from 'next/link'
import styles from './BeneficiairesTable.module.css'
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
  <tr className={classNames('fr-enlarge-link', styles.rowWithLink)}>
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
          styles.cell,
          column.alignRight && 'fr-text--right',
        )}
      >
        {row[column.field]}
      </td>
    ))}
    <td className={styles.rowLinkCell}>
      <Link href={row.href} className={styles.cellLink}>
        <span className="fr-sr-only">Voir la fiche de {row.label}</span>
      </Link>
    </td>
  </tr>
)
