'use client'

import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { MARQUER_L_ONBOARDING_COMME_VU_ACTION_KEY } from '@app/web/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/action/marquer-l-onboarding-comme-vu.key'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

const CompleteOnboardingButton = ({
  className,
  next,
}: {
  className?: string
  next: { href: string; label?: string }
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
