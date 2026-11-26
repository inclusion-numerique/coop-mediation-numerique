'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { inject } from '@/libraries/nextjs/injection'
import { RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY } from '../../action/rattraper-rdvs-sans-webhook.key'

const RefreshRdvDataOnLoad = ({
  synchroniserAuChargement,
}: {
  synchroniserAuChargement: boolean
}) => {
  const router = useRouter()

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
