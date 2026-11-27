'use client'

import type { ButtonProps } from '@codegouvfr/react-dsfr/Button'
import Button from '@codegouvfr/react-dsfr/Button'
import { type ReactNode, useState } from 'react'
import { buttonLoadingClassname } from '@/libraries/ui/utils'

const SignoutButton = ({
  children = 'Se déconnecter',
  callbackUrl = '/',
  className,
  proConnectIdTokenHint,
  ...buttonProps
}: {
  children?: ReactNode
  proConnectIdTokenHint?: string | null
  callbackUrl?: string
} & ButtonProps.Common &
  ButtonProps.AsButton) => {
  const [isLoading, setIsLoading] = useState(false)
  const onLogout = async () => {
    setIsLoading(true)

    const params = new URLSearchParams({ callbackUrl })
    window.location.href = `/deconnexion/start?${params.toString()}`
  }

  return (
    <Button
      type="button"
      size="large"
      onClick={onLogout}
      {...buttonProps}
      {...buttonLoadingClassname(isLoading, className)}
    >
      {children}
    </Button>
  )
}

export default SignoutButton
