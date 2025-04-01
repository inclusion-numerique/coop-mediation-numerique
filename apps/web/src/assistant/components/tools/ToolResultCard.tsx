import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { PropsWithChildren, ReactNode, useState } from 'react'
import styles from '../ChatThread.module.css'

const ToolResultCard = ({
  icon,
  title,
  url,
  children,
  expanded: expandedProp = false,
  isFirst,
  isLast,
}: PropsWithChildren<{
  icon?: ReactNode
  title?: string | null
  url?: string | null
  expanded?: boolean
  isFirst?: boolean
  isLast?: boolean
}>) => {
  const [expanded, setExpanded] = useState(expandedProp)

  return (
    <div
      className={classNames(
        styles.toolResultCard,
        isFirst && styles.toolResultCardFirst,
        isLast && styles.toolResultCardLast,
      )}
    >
      <div className={styles.toolResultHeader}>
        <div className="fr-flex fr-align-items-center fr-flex-gap-4v">
          {icon}
          {!!title && url ? (
            <a
              href={url}
              target="_blank"
              className="fr-link--underline-on-hover fr-flex-1"
            >
              <h3 className={styles.toolResultSourceTitle}>{title}</h3>
            </a>
          ) : (
            <h3 className={styles.toolResultSourceTitle}>{title}</h3>
          )}
        </div>
        <Button
          type="button"
          size="small"
          priority="tertiary no outline"
          title={expanded ? 'Réduire' : 'Développer'}
          iconId={expanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
          onClick={() => setExpanded(!expanded)}
        />
      </div>
      {expanded && <div className={styles.toolResultContent}>{children}</div>}
    </div>
  )
}

export default ToolResultCard
