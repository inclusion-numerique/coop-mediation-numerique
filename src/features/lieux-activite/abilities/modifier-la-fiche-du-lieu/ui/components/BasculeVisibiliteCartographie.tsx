'use client'

import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch'
import { useRouter } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import { createToast } from '@/libraries/ui/toast/create-toast'
import type { EnregistrerUneSection } from '../hooks/use-enregistrement-de-section'

export const BasculeVisibiliteCartographie = ({
  id,
  publie,
  enregistrer,
  children,
}: {
  id: string
  publie: boolean
  enregistrer: EnregistrerUneSection
  children: ReactNode
}) => {
  const router = useRouter()
  const [visible, setVisible] = useState(publie)
  const [enCours, setEnCours] = useState(false)

  const basculer = async (nouvelEtat: boolean) => {
    setVisible(nouvelEtat)
    setEnCours(true)

    const resultat = await enregistrer({
      id,
      modification: {
        section: 'VisibiliteCartographie',
        visiblePourCartographieNationale: nouvelEtat,
      },
    })

    setEnCours(false)

    if (!resultat.success) {
      setVisible(!nouvelEtat)
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    createToast({
      priority: 'success',
      message: 'Le lieu d’activité a bien été modifié.',
    })
    router.refresh()
  }

  return (
    <>
      <div className="fr-px-4w fr-py-3w">
        <ToggleSwitch
          label="Rendre ce lieu visible sur la cartographie nationale"
          checked={visible}
          disabled={enCours}
          showCheckedHint={false}
          onChange={basculer}
        />
      </div>
      {visible && children}
    </>
  )
}
