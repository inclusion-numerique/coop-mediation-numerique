import classNames from 'classnames'
import type { Route } from 'next'
import Link from 'next/link'
import RedAsterisk from '@/libraries/ui/components/form/RedAsterisk'

const RequiredFieldsDisclamer = <T extends string>({
  className,
  helpLink,
}: {
  className?: string
  helpLink?: { href: Route<T>; text: string }
}) => (
  <p className={classNames('fr-text--sm fr-hint-text', className)}>
    Les champs avec <RedAsterisk /> sont obligatoires.{' '}
    {helpLink ? (
      <Link
        href={helpLink.href}
        target="_blank"
        rel="noreferrer"
        className="fr-link fr-text--sm"
      >
        {helpLink.text}
      </Link>
    ) : null}
  </p>
)

export default RequiredFieldsDisclamer
