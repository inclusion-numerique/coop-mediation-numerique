'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { inject } from '@/libraries/nextjs/injection'
import { RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY } from '../../action/rattraper-rdvs-sans-webhook.key'

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

    inject(RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY)().then((resultat) => {
      if (resultat.success && resultat.data.derive > 0) {
        router.refresh()
      }
    })
  }, [synchroniserAuChargement, router])

  return null
}

export default RefreshRdvDataOnLoad
