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
      // Snooze for 24h
      expiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
