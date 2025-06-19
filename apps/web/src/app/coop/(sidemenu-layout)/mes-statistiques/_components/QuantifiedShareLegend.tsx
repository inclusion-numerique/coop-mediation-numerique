import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import classNames from 'classnames'
import type { QuantifiedShare } from '../quantifiedShare'
import styles from './QuantifiedShareLegend.module.scss'

export const QuantifiedShareLegend = ({
  colors,
  quantifiedShares,
  className,
}: {
  colors: string[]
  quantifiedShares: QuantifiedShare[]
  className?: string
}) => (
  <div
    className={classNames('fr-width-full fr-px-0', styles.container, className)}
  >
    {quantifiedShares.map(({ label, count, proportion }, index) => (
      <div key={label} className={styles.row}>
        <span
          className={classNames('ri-circle-fill', styles)}
          style={{ color: colors[index % colors.length] }}
        />
        <span
          className={classNames('fr-text--sm fr-flex-grow-1', styles.label)}
        >
          {label}
        </span>
        <span className={classNames('fr-text--sm fr-text--bold', styles.count)}>
          {numberToString(count ?? 0)}
        </span>
        <span
          className={classNames(
            'fr-text--sm fr-text--medium fr-text-mention--grey',
            styles.proportion,
          )}
        >
          {numberToPercentage(proportion)}
        </span>
      </div>
    ))}
  </div>
)
