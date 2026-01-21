'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'

const SignupReminders = () => {
  const mutation = trpc.user.signupReminders.useMutation()

  const handleAction = async () => {
    try {
      await mutation.mutateAsync()

      createToast({
        priority: 'success',
        message:
          'Envoie des mails de relance aux utilisateurs en cours d’inscription effectué',
      })
    } catch {
      createToast({
        priority: 'error',
        message:
          'Échec de l’envoi des mails de relance aux utilisateurs en cours d’inscription',
      })
    }
  }

  return (
    <div className="fr-grid-row fr-flex-gap-4v">
      <div className="fr-col">
        <h4 className="fr-h6 fr-mb-2v">
          Envoyer les mails de relance aux utilisateurs en cours d’inscription
        </h4>
        <p className="fr-text--sm fr-mb-0">
          Cette action envoie des mails de relance aux utilisateurs qui n’ont
          pas encore finalisé leur inscription&nbsp;:
        </p>
        <ul className="fr-text--sm fr-mb-0">
          <li>
            Des e-mails de relance sont adressés au bout de 7, 30 et 60 jours
            lorsque le processus d’inscription reste inachevé
          </li>
          <li>
            Passé un délai de 90 jours, un e-mail est adressé afin de notifier
            une suppression prévue dans 15 prochains jours
          </li>
          <li>
            Les comptes qui ne sont pas finalisés dans un délai de 105 jours
            sont supprimés, et les utilisateurs en sont notifiés
          </li>
        </ul>
      </div>
      <div className="fr-col-lg-auto fr-col-12">
        <Button
          type="button"
          iconId="fr-icon-play-line"
          size="small"
          priority="secondary"
          onClick={handleAction}
          disabled={mutation.isPending}
          {...buttonLoadingClassname(mutation.isPending)}
        >
          Lancer l’action
        </Button>
      </div>
    </div>
  )
}

export default withTrpc(SignupReminders)
