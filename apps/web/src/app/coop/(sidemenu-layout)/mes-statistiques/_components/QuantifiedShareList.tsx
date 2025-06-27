'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { CSSProperties, useMemo, useState } from 'react'
import { QuantifiedShare } from '../quantifiedShare'
import { ProgressItemList } from './ProgressItemList'

const orderQuantifiedShares = (
  quantifiedShares: QuantifiedShare[],
  order?: 'asc' | 'desc',
) => {
  if (!order) return quantifiedShares
  return quantifiedShares.sort((a, b) => {
    if (a.count > b.count) {
      return order === 'asc' ? 1 : -1
    }
    if (a.count < b.count) {
      return order === 'asc' ? -1 : 1
    }
    return 0
  })
}

export const QuantifiedShareList = ({
  quantifiedShares,
  limit,
  order,
  colors,
  color,
  truncateLabel = false,
  oneLineLabel = false,
  classes,
  style,
}: {
  quantifiedShares: QuantifiedShare[]
  order?: 'asc' | 'desc'
  truncateLabel?: boolean // If true, the label will be truncated to the first line and an ellipsis will be added
  oneLineLabel?: boolean // If true, the label will be displayed on one line only, may break the layout
  colors?: string[]
  color?: string
  // If limit is defined, the list will be truncated to the first limit.count items
  // and a button will be displayed to display the full list
  limit?: {
    showLabel: string
    hideLabel: string
    count: number
  }
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
}) => {
  const listShouldBeTruncacted =
    !!limit?.count && quantifiedShares.length > limit.count

  const [displayFullList, setdisplayFullList] = useState(false)

  const maxProportion = useMemo(
    () =>
      quantifiedShares.reduce(
        (max, quantifiedShare) =>
          quantifiedShare.proportion > max ? quantifiedShare.proportion : max,
        0,
      ),
    [quantifiedShares],
  )

  const orderedQuantifiedShares = orderQuantifiedShares(quantifiedShares, order)

  const quantifiedSharesToDisplay =
    !listShouldBeTruncacted || displayFullList
      ? orderedQuantifiedShares
      : orderedQuantifiedShares.slice(0, limit.count)

  return (
    <>
      <ProgressItemList
        items={quantifiedSharesToDisplay}
        colors={colors}
        color={color}
        maxProportion={maxProportion}
        truncateLabel={truncateLabel}
        oneLineLabel={oneLineLabel}
        classes={classes}
        style={style}
      />
      {listShouldBeTruncacted && (
        <Button
          type="button"
          size="small"
          priority="tertiary no outline"
          className="fr-mt-2w"
          onClick={() => setdisplayFullList(!displayFullList)}
        >
          {displayFullList ? (
            limit.hideLabel
          ) : (
            <>
              {limit.showLabel} · {quantifiedShares.length - limit.count}
            </>
          )}
          <span
            className={
              displayFullList
                ? 'fr-ml-1w ri-arrow-up-s-line'
                : 'fr-ml-1w ri-arrow-down-s-line'
            }
            aria-hidden
          />
        </Button>
      )}
    </>
  )
}
