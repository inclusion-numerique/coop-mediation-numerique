'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY } from '@/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/action/marquer-l-onboarding-comme-vu.key'
import { inject } from '@/libraries/nextjs/injection'
import { buttonLoadingClassname } from '@/libraries/ui/utils'

const CompleteOnboardingButton = ({
  className,
  next,
}: {
  className?: string
  next: { href: Route; label?: string }
}) => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()

  const onClick = () =>
    demarrer(async () => {
      await inject(MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY)()
      router.push(next.href)
      router.refresh()
    })

  return (
    <Button onClick={onClick} {...buttonLoadingClassname(enCours, className)}>
      {next.label ?? 'J’ai compris'}
    </Button>
  )
}

export default CompleteOnboardingButton
