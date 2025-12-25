import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import classNames from 'classnames'
import Link from 'next/link'
import React from 'react'

const InscriptionInvalidInformationContactSupportLink = ({
  className,
  linkClassName,
}: {
  className?: string
  linkClassName?: string
}) => (
  <div
    className={classNames('fr-width-full fr-text--center fr-mt-6v', className)}
  >
    <Link
      className={classNames('fr-link fr-link--sm fr-mb-0 ', linkClassName)}
      href={`mailto:${PublicWebAppConfig.contactEmail}`}
    >
      Ce ne sont pas vos informations&nbsp;? Contactez le support
    </Link>
  </div>
)

export default InscriptionInvalidInformationContactSupportLink
