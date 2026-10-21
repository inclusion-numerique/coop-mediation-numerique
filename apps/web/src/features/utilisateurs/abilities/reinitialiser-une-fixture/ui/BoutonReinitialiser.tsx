'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { useTransition } from 'react'
import { REINITIALISER_UNE_FIXTURE_ACTION_KEY } from '../action/reinitialiser-une-fixture.key'

export const BoutonReinitialiser = ({
  utilisateurId,
}: {
  utilisateurId: string
}) => {
  const [enCours, demarrer] = useTransition()

  const reinitialiser = () =>
    demarrer(async () => {
      const resultat = await inject(REINITIALISER_UNE_FIXTURE_ACTION_KEY)({
        utilisateurId,
      })

      createToast(
        resultat.success
          ? {
              priority: 'success',
              message: `${resultat.data.nom} a bien été réinitialisé`,
            }
          : { priority: 'error', message: resultat.error },
      )
    })

  return (
    <Button
      type="button"
      iconId="fr-icon-recycle-line"
      size="small"
      priority="secondary"
      onClick={reinitialiser}
      {...buttonLoadingClassname(enCours)}
    >
      Réinitialiser
    </Button>
  )
}
