'use client'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import { type CSSProperties, Fragment } from 'react'

const ProgressBar = ({
  progress = [],
  displayProgress = false,
  min = 0,
  max = 100,
  size = 'medium',
  colors = [],
  className,
  tooltopKey,
  style,
}: {
  progress?: { percentage: number; count?: number; label: string }[]
  displayProgress?: boolean
  min?: number
  max?: number
  size?: 'medium' | 'small' | 'large'
  colors?: string[]
  className?: string
  tooltopKey?: string
  style?: CSSProperties
}) => (
  <span
    className={classNames(
      className,
      progress.length > 1 && 'fr-progress-stacked',
      size === 'small' && 'fr-progress--sm',
      size === 'large' && 'fr-progress--lg',
    )}
    style={style}
  >
    {progress.map(({ percentage, label, count }, index) => (
      <Fragment key={label}>
        {tooltopKey && (
          <span
            className="fr-tooltip fr-placement fr-text--md"
            id={`tooltip-progress-bar-${tooltopKey}-${index}`}
            role="tooltip"
            aria-hidden
          >
            {label} :{' '}
            <span className="fr-text--bold">{count ?? percentage}</span>
          </span>
        )}
        <motion.span
          aria-describedby={
            tooltopKey
              ? `tooltip-progress-bar-${tooltopKey}-${index}`
              : undefined
          }
          key={label}
          className={classNames(
            'fr-progress',
            size === 'small' && 'fr-progress--sm',
            size === 'large' && 'fr-progress--lg',
          )}
          role="progressbar"
          aria-label={label}
          aria-valuenow={percentage ?? 0}
          aria-valuemin={min}
          aria-valuemax={max}
          animate={
            progress.length > 1
              ? { width: `${percentage ?? 0}%`, transition: { duration: 0.2 } }
              : {}
          }
        >
          <motion.span
            className={`fr-progress__bar ${colors[index % colors.length]}`}
            style={{
              backgroundColor:
                colors.length > 0
                  ? colors[index % colors.length]
                  : 'var(--background-active-blue-france)',
            }}
            animate={
              progress.length === 1
                ? {
                    width: `${percentage ?? 0}%`,
                    transition: { duration: 0.2 },
                  }
                : {}
            }
          >
            {displayProgress && `${percentage ?? 0}%`}
          </motion.span>
        </motion.span>
      </Fragment>
    ))}
  </span>
)

export default ProgressBar
