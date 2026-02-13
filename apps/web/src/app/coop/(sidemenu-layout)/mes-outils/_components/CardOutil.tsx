import { Pictogram } from '@app/web/features/pictograms/pictogram'
import type { FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { ReactNode } from 'react'

export const CardOutil = ({
  pictogram: Pictogram,
  title,
  slug,
  accessUrl,
  children,
  isNew,
  topRight,
  actionButton,
}: {
  pictogram: Pictogram
  title: string
  slug: string
  accessUrl: string
  children: ReactNode
  isNew?: boolean
  topRight?: ReactNode
  actionButton?: {
    title?: string
    children?: ReactNode
    iconId?: FrIconClassName | RiIconClassName
  }
}) => (
  <div className="fr-border-radius--16 fr-border fr-height-full fr-flex fr-direction-column">
    <div
      className={classNames(
        'fr-flex fr-align-items-center fr-align-items-xl-start fr-flex-gap-6v fr-height-full fr-direction-xl-column fr-p-8v',
      )}
    >
      <div className="fr-flex fr-justify-content-space-between align-items-center fr-width-full">
        <Pictogram
          className="fr-border-radius--16 fr-p-3v"
          style={{
            backgroundColor: 'var(--blue-france-alt-light--action-low-dark)',
          }}
          width={66}
          height={66}
          aria-hidden
        />
        {isNew && (
          <div>
            <Badge small severity="new">
              Intégration disponible&nbsp;!
            </Badge>
          </div>
        )}
        {topRight && <div>{topRight}</div>}
      </div>
      <div className="fr-flex-grow-1">
        <h3 className="fr-h6 fr-mb-2v">{title}</h3>
        <p className="fr-mb-0 fr-text-mention--grey">{children}</p>
      </div>
    </div>
    <hr className="fr-separator-1px" />
    <div className="fr-px-8v fr-py-6v fr-flex fr-justify-content-space-between">
      <Button
        priority="tertiary no outline"
        size="small"
        title={`En savoir plus à propos de ${title}`}
        linkProps={{ href: `/coop/mes-outils/${slug}` }}
        iconId="fr-icon-information-line"
        children="En savoir plus"
        {...actionButton}
      />
      <Button
        priority="tertiary no outline"
        size="small"
        title={`Accéder au service ${title}`}
        linkProps={{
          href: accessUrl,
          target: '_blank',
          rel: 'noreferrer',
        }}
      >
        Accéder
      </Button>
    </div>
  </div>
)
