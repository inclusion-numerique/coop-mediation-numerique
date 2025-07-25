import Badge from '@codegouvfr/react-dsfr/Badge'
import classNames from 'classnames'
import Image from 'next/image'
import { ReactNode } from 'react'

export const CardOutil = ({
  logo,
  title,
  slug,
  accessUrl: _accessUrl,
  children,
  isNew,
}: {
  logo: string
  title: string
  slug: string
  accessUrl?: string
  children: ReactNode
  isNew?: boolean
}) => (
  <div className="fr-border-radius--16 fr-border fr-py-10v fr-px-8v fr-height-full fr-flex fr-direction-column fr-enlarge-link">
    <div
      className={classNames(
        'fr-flex fr-align-items-center fr-align-items-xl-start fr-flex-gap-6v fr-height-full fr-direction-xl-column',
      )}
    >
      <div className="fr-flex fr-justify-content-space-between align-items-center fr-width-full">
        <Image
          className="fr-background-alt--blue-france fr-border-radius--16 fr-p-2w"
          width={88}
          height={88}
          src={logo}
          alt=""
        />
        {isNew && (
          <div>
            <Badge severity="new">Intégration disponible&nbsp;!</Badge>
          </div>
        )}
      </div>
      <div className=" fr-flex-grow-1">
        <h3 className="fr-h6 fr-mb-2w">{title}</h3>
        <p className="fr-mb-0 fr-text-mention--grey">{children}</p>
        <a
          className="fr-flex-basis-0"
          title={`En savoir plus à propos de ${title}`}
          href={`/coop/mes-outils/${slug}`}
          aria-label={`En savoir plus à propos de ${title}`}
        />
      </div>
      <div className="fr-flex fr-justify-content-end fr-width-full">
        <span className="fr-icon-arrow-right-line fr-text-title--blue-france" />
      </div>
    </div>
  </div>
)
