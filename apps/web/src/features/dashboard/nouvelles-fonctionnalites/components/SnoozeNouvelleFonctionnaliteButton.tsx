'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { setNouvelleFonctionnaliteSkipCookie } from '../nouvelleFonctionnaliteCookie'

const SupprimerNouvelleFonctionnaliteCardButton = ({
  featureId,
  label = 'Voir plus tard',
  className,
}: { featureId: string; label?: string; className?: string }) => {
  const router = useRouter()

  const onClick = () => {
    setNouvelleFonctionnaliteSkipCookie({
      featureId,
      // Snooze until browser closed
      expiration: 'session',
    })
    router.refresh()
  }

  return (
    <Button
      onClick={onClick}
      title="Masquer temporairement cette notification"
      priority="tertiary no outline"
      type="button"
      size="small"
      className={className}
    >
      {label}
    </Button>
  )
}

export default SupprimerNouvelleFonctionnaliteCardButton
