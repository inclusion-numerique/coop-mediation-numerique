'use client'

import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  hrefDeConnexion,
  hrefDeLEquipe,
} from '@/features/equipe/ui/presenters/liens.presenter'
import { routeConstruite } from '@/libraries/nextjs'
import { inject } from '@/libraries/nextjs/injection'
import { createToast } from '@/libraries/ui/toast'
import { buttonLoadingClassname } from '@/libraries/ui/utils'
import { ACCEPTER_UNE_INVITATION_ACTION_KEY } from '../../action/accepter-une-invitation.key'
import { REFUSER_UNE_INVITATION_ACTION_KEY } from '../../action/refuser-une-invitation.key'

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
    router.push(hrefDeLEquipe(coordinateurId))
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

    router.push(routeConstruite(`${lien}/refuser`))
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
                href: hrefDeConnexion(lien),
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
