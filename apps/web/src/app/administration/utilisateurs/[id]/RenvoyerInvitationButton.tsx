'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { RELANCER_UNE_INVITATION_ACTION_KEY } from '@app/web/features/equipe/abilities/relancer-une-invitation/action/relancer-une-invitation.key'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const RenvoyerInvitationButton = ({
  email,
  coordinateurId,
}: {
  email: string
  coordinateurId: string
}) => {
  const [enCours, setEnCours] = useState(false)
  const router = useRouter()

  const onClick = async () => {
    setEnCours(true)
    const resultat = await inject(RELANCER_UNE_INVITATION_ACTION_KEY)({
      email,
      coordinateurId,
    })
    setEnCours(false)

    if (!resultat.success) {
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    router.refresh()
    createToast({
      priority: 'success',
      message: `L'invitation a été renvoyée à ${email}`,
    })
  }

  return (
    <Button
      type="button"
      iconId="fr-icon-mail-line"
      size="small"
      priority="tertiary"
      onClick={onClick}
      {...buttonLoadingClassname(enCours)}
    >
      Renvoyer l'invitation
    </Button>
  )
}

export default RenvoyerInvitationButton
