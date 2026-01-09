'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

const BackButton = ({
  href,
  children = 'Retour',
  className,
}: {
  href?: string
  children?: ReactNode
  className?: string
}) => {
  const router = useRouter()

  const buttonClassName = classNames('fr-my-4v', className)

  if (href) {
    return (
      <Button
        priority="tertiary no outline"
        size="small"
        linkProps={{ href }}
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
      size="small"
      onClick={() => router.back()}
      className={buttonClassName}
      iconId="fr-icon-arrow-left-line"
    >
      {children}
    </Button>
  )
}

export default BackButton
