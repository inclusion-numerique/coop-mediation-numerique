'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useState, useTransition } from 'react'
import { RENOUVELER_LE_SECRET_ACTION_KEY } from '../action/renouveler-le-secret.key'

export const RenouvelerLeSecret = ({
  clientApiId,
}: {
  clientApiId: string
}) => {
  const [secret, setSecret] = useState<string | null>(null)
  const [enCours, demarrer] = useTransition()

  const renouveler = () =>
    demarrer(async () => {
      setSecret(null)
      const resultat = await inject(RENOUVELER_LE_SECRET_ACTION_KEY)({
        clientApiId,
      })

      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      createToast({
        priority: 'success',
        message: 'Un secret unique a bien été généré',
      })
      setSecret(resultat.data.secret)
    })

  return secret === null ? (
    <>
      <Notice
        className="fr-notice--new fr-mb-4v"
        title="Générer un secret désactive les secrets précédents."
      />
      <Button
        iconId="fr-icon-refresh-line"
        onClick={renouveler}
        {...buttonLoadingClassname(enCours)}
      >
        Générer un token secret
      </Button>
    </>
  ) : (
    <>
      <Notice
        className="fr-notice--warning fr-mb-4v"
        title="Ce secret est unique, vous ne pourrez pas le consulter à nouveau après avoir quitté la page."
      />
      <pre className="fr-text--sm fr-p-4v fr-border-radius--8 fr-background-alt--blue-ecume">
        {secret}
      </pre>
      <p className="fr-text---sm fr-mb-4v">
        Vous pouvez maintenant utiliser ce secret pour authentifier les requêtes
        vers l’API avec le header &quot;Authorization&quot;&nbsp;:
      </p>
      <pre className="fr-text--sm fr-p-4v fr-border-radius--8 fr-background-alt--blue-ecume">
        Bearer {clientApiId}:{secret}
      </pre>
      <Button
        iconId="fr-icon-lock-line"
        onClick={renouveler}
        {...buttonLoadingClassname(enCours)}
      >
        Générer un nouveau token secret
      </Button>
    </>
  )
}
