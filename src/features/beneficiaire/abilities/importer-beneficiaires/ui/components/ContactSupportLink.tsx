import classNames from 'classnames'
import type { ReactNode } from 'react'
import { contactEmail } from '@/configuration/projet'

const ContactSupportLink = ({
  className,
  children = 'Contactez le support',
  size = 'sm',
}: {
  className?: string
  children?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) => (
  <a
    href={`mailto:${contactEmail}`}
    className={classNames(`fr-link fr-link--${size} fr-mb-0`, className)}
  >
    {children}
  </a>
)

export default ContactSupportLink
