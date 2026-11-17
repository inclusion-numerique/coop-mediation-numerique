'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { inject } from '@app/web/libs/injection/client'
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ACCEPTER_UNE_INVITATION_ACTION_KEY } from '../abilities/accepter-une-invitation/action/accepter-une-invitation.key'
import { REFUSER_UNE_INVITATION_ACTION_KEY } from '../abilities/refuser-une-invitation/action/refuser-une-invitation.key'

const ReponseAInvitation = ({
  email,
  coordinateurId,
  lien,
  connecte,
}: {
  email: string
  coordinateurId: string
  lien: string
  connecte: boolean
}) => {
  const router = useRouter()
  const [enCours, setEnCours] = useState(false)

  const accepter = async () => {
    setEnCours(true)
    const resultat = await inject(ACCEPTER_UNE_INVITATION_ACTION_KEY)({
      email,
      coordinateurId,
    })
    setEnCours(false)

    if (!resultat.success) {
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    createToast({
      priority: 'success',
      message: 'Vous avez accepté l’invitation',
    })
    router.push(`/coop/mes-equipes/${coordinateurId}`)
  }

  const refuser = async () => {
    setEnCours(true)
    const resultat = await inject(REFUSER_UNE_INVITATION_ACTION_KEY)({
      email,
      coordinateurId,
    })
    setEnCours(false)

    if (!resultat.success) {
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    router.push(`${lien}/refuser`)
  }

  return (
    <ButtonsGroup
      buttons={[
        connecte
          ? {
              children: 'Accepter l’invitation',
              onClick: accepter,
              ...buttonLoadingClassname(enCours),
            }
          : {
              children: 'Accepter l’invitation',
              linkProps: {
                href: `/connexion?suivant=${encodeURIComponent(lien)}`,
              },
            },
        {
          children: 'Refuser l’invitation',
          onClick: refuser,
          priority: 'secondary',
          ...buttonLoadingClassname(enCours),
        },
      ]}
    />
  )
}

export default ReponseAInvitation
