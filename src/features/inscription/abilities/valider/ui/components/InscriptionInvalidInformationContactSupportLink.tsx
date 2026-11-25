import classNames from 'classnames'
import Link from 'next/link'
import { contactEmail } from '@/configuration/projet'

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
      href={`mailto:${contactEmail}`}
    >
      Ce ne sont pas vos informations&nbsp;? Contactez le support
    </Link>
  </div>
)

export default InscriptionInvalidInformationContactSupportLink
