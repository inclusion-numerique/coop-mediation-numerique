'use client'

import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import classNames from 'classnames'
import type { QuantifiedShare } from '../quantifiedShare'
import styles from './QuantifiedShareLegend.module.scss'

export const QuantifiedShareLegend = ({
  colors,
  quantifiedShares,
  className,
  truncateLabel = false,
  oneLineLabel = false,
}: {
  colors: string[]
  quantifiedShares: QuantifiedShare[]
  className?: string
  truncateLabel?: boolean // If true, the label will be truncated to the first line and an ellipsis will be added
  oneLineLabel?: boolean // If true, the label will be displayed on one line only, may break the layout
}) => (
  <div
    className={classNames('fr-width-full fr-px-0', styles.container, className)}
  >
    {quantifiedShares.map(({ label, count, proportion }, index) => (
      <div key={label} className={styles.row}>
        <span
          className={classNames('ri-circle-fill', styles)}
          style={{ color: colors[index % colors.length] }}
          aria-hidden
        />
        <span
          className={classNames(
            'fr-text--sm',
            styles.label,
            truncateLabel && styles.truncatedLabel,
            oneLineLabel && styles.oneLineLabel,
          )}
          title={truncateLabel ? label : undefined}
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
