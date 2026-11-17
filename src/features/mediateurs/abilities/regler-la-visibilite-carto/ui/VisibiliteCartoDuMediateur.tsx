'use client'

import { createToast } from '@app/ui/toast/createToast'
import { inject } from '@app/web/libs/injection/client'
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { REGLER_LA_VISIBILITE_CARTO_ACTION_KEY } from '../action/regler-la-visibilite-carto.key'

export const VisibiliteCartoDuMediateur = ({
  mediateurId,
  visible,
}: {
  mediateurId: string
  visible: boolean
}) => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()

  const basculer = () =>
    demarrer(async () => {
      const resultat = await inject(REGLER_LA_VISIBILITE_CARTO_ACTION_KEY)({
        mediateurId,
        visible: !visible,
      })

      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      router.refresh()
      createToast({
        priority: 'success',
        message: (
          <>
            Le profil de ce médiateur{' '}
            <strong>{visible ? 'ne sera plus' : 'sera'}</strong> visible sur la
            cartographie sous 24h
          </>
        ),
      })
    })

  return (
    <ToggleSwitch
      inputTitle="Visibilité du profil du médiateur sur la cartographie"
      disabled={enCours}
      checked={visible}
      label={<span className="fr-my-auto">Profil visible</span>}
      labelPosition="left"
      showCheckedHint
      onChange={basculer}
    />
  )
}
