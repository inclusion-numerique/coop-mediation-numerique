import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import classNames from 'classnames'
import type { CSSProperties } from 'react'
import type { QuantifiedShare } from '../quantifiedShare'
import ProgressBar from './ProgressBar'
import styles from './ProgressItemList.module.scss'

export const ProgressItemList = ({
  items,
  maxProportion,
  colors,
  color,
  truncateLabel = false,
  oneLineLabel = false,
  classes,
  style,
}: {
  items: QuantifiedShare[]
  maxProportion: number
  truncateLabel?: boolean // If true, the label will be truncated to the first line and an ellipsis will be added
  color?: string // Can be used with a single color
  colors?: string[] // Or an array of colors for each item
  oneLineLabel?: boolean // If true, the label will be displayed on one line only, may break the layout
  classes?: {
    label?: string
    count?: string
    proportion?: string
    progressBar?: string
  }
  style?: {
    label?: CSSProperties
    count?: CSSProperties
    proportion?: CSSProperties
    progressBar?: CSSProperties
  }
}) => (
  <div className={classNames('fr-width-full', styles.container)}>
    {items.map(({ label, count, proportion }, index) => {
      const computedColors = color
        ? [color] // only one color is provided
        : colors && colors.length > 0
          ? [colors[index % colors.length]]
          : []

      return (
        <div key={label} className={styles.row}>
          <span
            className={classNames(
              'fr-text--sm',
              styles.label,
              truncateLabel && styles.truncatedLabel,
              oneLineLabel && styles.oneLineLabel,
              classes?.label,
            )}
            title={truncateLabel ? label : undefined}
            style={style?.label}
          >
            {label}
          </span>
          <span
            className={classNames(
              'fr-text--sm fr-text--right fr-text--bold fr-whitespace-nowrap',
              styles.count,
              classes?.count,
            )}
            style={style?.count}
          >
            {numberToString(count)}
          </span>
          <span
            className={classNames(
              'fr-text--sm fr-text--right fr-text--medium fr-text-mention--grey fr-whitespace-nowrap',
              styles.proportion,
              classes?.proportion,
            )}
            style={style?.proportion}
          >
            {numberToPercentage(proportion)}
          </span>
          <ProgressBar
            className={classNames(styles.progressBar, classes?.progressBar)}
            style={style?.progressBar}
            progress={[
              {
                label,
                percentage:
                  maxProportion === 0 ? 0 : (100 * proportion) / maxProportion,
              },
            ]}
            colors={computedColors}
          />
        </div>
      )
    })}
  </div>
)
