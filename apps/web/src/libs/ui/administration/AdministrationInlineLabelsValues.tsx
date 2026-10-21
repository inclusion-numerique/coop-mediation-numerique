import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import classNames from 'classnames'
import { Fragment, ReactNode } from 'react'

export type LabelAndValue = {
  label: ReactNode
  value: ReactNode
}

const AdministrationInlineLabelsValues = ({
  items,
  className,
}: {
  items: (LabelAndValue | undefined | null)[]
  className?: string
}) => (
  <div
    className={classNames(
      'fr-display-grid fr-grid-cols-auto-1fr fr-grid-gap-2v-4v',
      className,
    )}
  >
    {items.filter(onlyDefinedAndNotNull).map(({ label, value }, index) => (
      <Fragment key={index}>
        <p className="fr-text--sm fr-mb-0">
          <strong>{label}&nbsp;:</strong>
        </p>
        <div>{value}</div>
      </Fragment>
    ))}
  </div>
)

export default AdministrationInlineLabelsValues
