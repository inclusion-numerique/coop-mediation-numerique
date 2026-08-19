'use client'

import { rattraperRdvsSansWebhookAction } from '@app/web/app/_actions/rdvsp/rattraper-rdvs-sans-webhook.action'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

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

  // Même garde que dans la liste d'activités : l'effet est joué deux fois en
  // mode strict, et deux passes concurrentes se disputeraient les mêmes lignes.
  const rattrapageLance = useRef(false)

  useEffect(() => {
    if (!synchroniserAuChargement || rattrapageLance.current) {
      return
    }

    rattrapageLance.current = true

    rattraperRdvsSansWebhookAction().then((resultat) => {
      if (resultat.success && resultat.data.derive > 0) {
        router.refresh()
      }
    })
  }, [synchroniserAuChargement, router])

  return null
}

export default RefreshRdvDataOnLoad
