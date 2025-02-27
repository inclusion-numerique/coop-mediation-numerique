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
      href="mailto:conseiller-numerique@anct.gouv.fr"
    >
      Ce ne sont pas vos informations&nbsp;? Vous pouvez contactez le support du
      dispositif Conseiller Numérique
    </Link>
  </div>
)

export default InscriptionInvalidInformationContactSupportLink
