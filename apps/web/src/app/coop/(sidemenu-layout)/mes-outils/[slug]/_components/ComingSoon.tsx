import Notice from '@codegouvfr/react-dsfr/Notice'
import classNames from 'classnames'
import Link from 'next/link'
import React from 'react'

export const ComingSoon = ({
  text,
  className,
}: {
  text: string
  className?: string
}) => (
  <Notice
    className={classNames('fr-notice--new fr-notice--flex fr-mb-3w', className)}
    title={
      <span className="fr-text--regular">
        <span className="fr-text-default--grey fr-text--bold fr-display-block">
          Prochaines évolutions à venir&nbsp;!
        </span>
        <span className="fr-display-block fr-text--sm fr-my-1v">
          {text}.&nbsp;
          <Link
            className="fr-link fr-text--sm"
            href="https://projets.suite.anct.gouv.fr/boards/1572441353164424613"
            target="_blank"
            rel="noreferrer"
          >
            En savoir plus sur les prochaines évolutions de la plateforme
          </Link>
        </span>
      </span>
    }
  />
)
