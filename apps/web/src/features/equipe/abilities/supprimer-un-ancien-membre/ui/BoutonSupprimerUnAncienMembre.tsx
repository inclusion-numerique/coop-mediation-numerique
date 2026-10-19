'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { inject } from '@app/web/libs/injection/client'
import { dateAsDayConventional } from '@app/web/utils/dateAsDay'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY } from '../action/supprimer-un-ancien-membre.key'

const BoutonSupprimerUnAncienMembre = ({
  mediateurId,
  coordinateurId,
  nomAffiche,
  depuis,
  jusquA,
}: {
  mediateurId: string
  coordinateurId: string
  nomAffiche: string
  depuis: Date
  jusquA: Date
}) => {
  const [estMonte, setEstMonte] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const router = useRouter()

  useEffect(() => setEstMonte(true), [])

  const {
    Component: Modale,
    close,
    buttonProps,
  } = createModal({
    id: `delete-from-archive-modal-${mediateurId}`,
    isOpenedByDefault: false,
  })

  const supprimer = async () => {
    setEnCours(true)
    const resultat = await inject(SUPPRIMER_UN_ANCIEN_MEMBRE_ACTION_KEY)({
      mediateurId,
      coordinateurId,
    })
    setEnCours(false)
    close()

    if (!resultat.success) {
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    router.refresh()
    createToast({
      priority: 'success',
      message: `${nomAffiche} a bien été supprimé définitivement de vos archives`,
    })
  }

  return (
    <>
      {estMonte &&
        createPortal(
          <Modale
            title={`Supprimer définitivement '${nomAffiche}' de vos archives`}
            buttons={[
              { children: 'Annuler', priority: 'secondary', onClick: close },
              {
                children: 'Supprimer définitivement',
                onClick: supprimer,
                ...buttonLoadingClassname(enCours),
              },
            ]}
          >
            Êtes-vous sûr de vouloir supprimer définitivement '{nomAffiche}' de
            vos archives&nbsp;?
            <Notice
              className="fr-notice--flex fr-mt-4v fr-notice--warning"
              title={
                <span className="fr-text--left fr-text-default--grey fr-text--regular">
                  Vous n'aurez plus accès à ses activités et ses statistiques
                  archivés{' '}
                  <b>
                    du {dateAsDayConventional(depuis)} au{' '}
                    {dateAsDayConventional(jusquA)}.
                  </b>
                </span>
              }
            />
          </Modale>,
          document.body,
        )}
      <Button
        title="Supprimer définitivement ce membre de mon équipe"
        size="small"
        priority="tertiary"
        {...buttonProps}
        {...buttonLoadingClassname(
          enCours,
          'fr-text-default--error fr-position-relative fr-index-10',
        )}
      >
        <span className="ri-delete-bin-line" aria-hidden />
      </Button>
    </>
  )
}

export default BoutonSupprimerUnAncienMembre
