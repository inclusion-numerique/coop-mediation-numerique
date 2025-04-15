import type { SelectOption } from '@app/ui/components/Form/utils/options'
import classNames from 'classnames'

import Stars from '@app/web/components/Stars'
import { Fragment, type KeyboardEventHandler, memo } from 'react'
import styles from './RichCardLabel.module.css'

export type RichCardOptionExtras = {
  illustration?: string
  stars?: number
  maxStars?: number
  tooltips?: string[]
}

export type RichCardOption<T extends string> = SelectOption<
  T,
  RichCardOptionExtras
>

export type RichCardLabelClasses = {
  labelContainer?: string
}

export type RichCardLabelProps<T extends string> = {
  option: RichCardOption<T>
  htmlFor: string
  className?: string
  paddingX?: 16 | 24
  paddingRight?: 16 | 24
  classes?: RichCardLabelClasses
}

export const richCardFieldsetElementClassName = styles.fieldsetElement

export const richCardRadioGroupClassName = styles.radioGroup

const RichCardLabel = memo(
  <T extends string>({
    option,
    htmlFor,
    className,
    paddingX = 24,
    paddingRight,
    classes,
  }: RichCardLabelProps<T>) => {
    const tooltipId = `${htmlFor}-tooltip`
    const hintsTooltip = option.extra?.tooltips ? (
      <div className={styles.tooltipContainer}>
        <button
          type="button"
          className="fr-btn--tooltip fr-btn"
          aria-describedby={tooltipId}
        >
          Information
        </button>
      </div>
    ) : null

    const tooltipContent = option.extra?.tooltips ? (
      <span
        className="fr-tooltip fr-placement"
        id={tooltipId}
        role="tooltip"
        aria-hidden="true"
      >
        {option.extra.tooltips.map((tooltipContent) => (
          <Fragment key={tooltipContent}>
            {tooltipContent}
            <br />
          </Fragment>
        ))}
      </span>
    ) : null

    const handleKeyPress: KeyboardEventHandler = (event) => {
      if (event.key === ' ' && event.target instanceof HTMLLabelElement) {
        event.preventDefault()
        const inputElement = document.getElementById(htmlFor)
        if (inputElement) {
          inputElement.click()
        }
      }
    }

    return (
      <>
        <label
          htmlFor={htmlFor}
          className={classNames(
            'fr-border-radius--4 fr-border',
            styles.label,
            paddingX === 16 ? styles.paddingX16 : styles.paddingX24,
            paddingRight
              ? paddingRight === 16
                ? styles.paddingRight16
                : styles.paddingRight24
              : null,
            className,
          )}
          tabIndex={0}
          onKeyDown={handleKeyPress}
        >
          <div className="fr-flex fr-justify-content-space-between fr-flex-gap-4v fr-width-full fr-height-full">
            <div
              className={classNames(
                'fr-text--sm fr-mb-0 fr-text--medium fr-flex-grow-1 fr-flex fr-justify-content-center fr-direction-column',
                classes?.labelContainer,
              )}
            >
              {typeof option.extra?.stars === 'number' && (
                <Stars
                  count={option.extra.stars}
                  max={option.extra.maxStars}
                  className="fr-mb-1v"
                />
              )}
              {option.label}
              {!!option.hint && (
                <>
                  <br />
                  <span className="fr-text--xs fr-mb-0 fr-text--regular fr-text-mention--grey fr-flex-grow-1">
                    {option.hint}
                  </span>{' '}
                </>
              )}
            </div>

            {!!option.extra?.illustration && (
              <div
                className={classNames(
                  'fr-flex-shrink-0 fr-flex fr-align-items-center',
                )}
              >
                <img
                  className={styles.illustration}
                  alt=""
                  src={option.extra.illustration}
                />
              </div>
            )}
          </div>
          {hintsTooltip}
        </label>
        {tooltipContent}
      </>
    )
  },
)
RichCardLabel.displayName = 'RichCardLabel'

export default RichCardLabel
