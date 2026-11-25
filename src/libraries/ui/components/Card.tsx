import classNames from 'classnames'
import type { Route } from 'next'
import Link from 'next/link'
import { ReactNode } from 'react'

const Card = <T extends string>({
  id,
  className,
  'data-testid': dataTestid,
  title,
  titleAs: CardTitle = 'h3',
  href,
  isExternal = false,
  enlargeLink = href != null,
  noBorder = false,
  description,
  children,
  header,
  action,
  contentSeparator = false,
  arrowTop = false,
  arrowSm = false,
  classes = {},
}: {
  id?: string | undefined
  className?: string | undefined
  'data-testid'?: string | undefined
  title?: ReactNode | undefined
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | undefined
  href?: Route<T> | undefined
  isExternal?: boolean | undefined
  enlargeLink?: boolean | undefined
  noBorder?: boolean | undefined
  description?: ReactNode | undefined
  children?: ReactNode | undefined
  header?: ReactNode | undefined
  action?: ReactNode | undefined
  contentSeparator?: boolean | undefined
  arrowTop?: boolean | undefined
  arrowSm?: boolean | undefined
  classes?:
    | {
        content?: string | undefined
        frame?:
          | {
              content?: string | undefined
            }
          | undefined
      }
    | undefined
}) => (
  <div
    id={id}
    data-testid={dataTestid}
    className={classNames(className, 'fr-card', [
      noBorder && 'fr-card--no-border',
      enlargeLink && 'fr-enlarge-link',
      arrowTop && 'fr-card--arrow-top',
      arrowSm && 'fr-card--arrow-sm',
    ])}
  >
    <div className="fr-card__body">
      <div className={classNames('fr-card__content', classes.frame?.content)}>
        {title && (
          <div className="fr-flex fr-justify-content-space-between fr-flex-gap-6v">
            <div>
              <CardTitle className="fr-card__title fr-flex fr-justify-content-space-between fr-flex-gap-6v">
                {href ? (
                  <Link href={href} target={isExternal ? '_blank' : ''}>
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </CardTitle>
              {description && (
                <div className="fr-card__desc fr-my-0 fr-text-mention--grey">
                  {description}
                </div>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}

        {children && (
          <div
            className={classNames(
              'fr-card__end',
              !title && 'fr-mt-0 fr-pt-0',
              classes.content,
              !title,
            )}
          >
            {contentSeparator && (
              <hr className={'fr-pb-4w carte__separateur'} />
            )}
            {children}
          </div>
        )}
      </div>
    </div>
    {header ?? <div className="fr-card__header">{header}</div>}
  </div>
)

export default Card
