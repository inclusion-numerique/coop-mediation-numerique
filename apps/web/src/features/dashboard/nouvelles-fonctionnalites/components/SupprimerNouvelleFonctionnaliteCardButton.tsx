'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { setNouvelleFonctionnaliteSkipCookie } from '../nouvelleFonctionnaliteCookie'

const SupprimerNouvelleFonctionnaliteCardButton = ({
  featureId,
}: { featureId: string }) => {
  const router = useRouter()

  const onClick = () => {
    setNouvelleFonctionnaliteSkipCookie({ featureId })
    router.refresh()
  }

  return (
    <Button
      onClick={onClick}
      title="Masquer définitivement cette notification"
      iconId="fr-icon-close-line"
      priority="tertiary no outline"
      size="small"
      type="button"
    />
  )
}

export default SupprimerNouvelleFonctionnaliteCardButton
