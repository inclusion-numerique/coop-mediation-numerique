'use client'

import { rattraperRdvsSansWebhookAction } from '@app/web/app/_actions/rdvsp/rattraper-rdvs-sans-webhook.action'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Rattrape au chargement les rendez-vous des organisations dont le webhook n'a
 * pas pu être posé. La page n'est rafraîchie que si la passe a corrigé quelque
 * chose.
 */
const RefreshRdvDataOnLoad = ({
  synchroniserAuChargement,
}: {
  synchroniserAuChargement: boolean
}) => {
  const router = useRouter()

  useEffect(() => {
    if (!synchroniserAuChargement) {
      return
    }

    rattraperRdvsSansWebhookAction().then((resultat) => {
      if (resultat.success && resultat.data.derive > 0) {
        router.refresh()
      }
    })
  }, [synchroniserAuChargement, router])

  return null
}

export default RefreshRdvDataOnLoad
