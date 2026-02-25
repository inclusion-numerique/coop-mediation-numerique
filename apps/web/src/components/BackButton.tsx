'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import { ReactNode } from 'react'

const BackButton = ({
  href,
  fallbackHref,
  children = 'Retour',
  className,
}: {
  href?: string
  fallbackHref?: string
  children?: ReactNode
  className?: string
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const retour = searchParams.get('retour')
  const resolvedHref = href ?? (fallbackHref ? retour ?? fallbackHref : null)

  const buttonClassName = classNames('fr-mb-4v', className)

  if (resolvedHref) {
    return (
      <Button
        priority="tertiary no outline"
        linkProps={{ href: resolvedHref }}
        className={buttonClassName}
        iconId="fr-icon-arrow-left-line"
      >
        {children}
      </Button>
    )
  }

  return (
    <Button
      priority="tertiary no outline"
      onClick={() => router.back()}
      className={buttonClassName}
      iconId="fr-icon-arrow-left-line"
    >
      {children}
    </Button>
  )
}

export default BackButton
