import React from 'react'
import Link from 'next/link'
import classNames from 'classnames'

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
    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
    <Link
      className={classNames('fr-link fr-link--sm fr-mb-0 ', linkClassName)}
      href="mailto:coop-numerique@anct.gouv.fr"
    >
      Ce ne sont pas vos informations&nbsp;? Contactez le support
    </Link>
  </div>
)

export default InscriptionInvalidInformationContactSupportLink
