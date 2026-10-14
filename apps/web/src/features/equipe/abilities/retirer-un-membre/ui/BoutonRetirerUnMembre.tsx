'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { RETIRER_UN_MEMBRE_ACTION_KEY } from '../action/retirer-un-membre.key'

const BoutonRetirerUnMembre = ({
  mediateurId,
  coordinateurId,
  nomAffiche,
}: {
  mediateurId: string
  coordinateurId: string
  nomAffiche: string
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
    id: `remove-from-team-modal-${mediateurId}`,
    isOpenedByDefault: false,
  })

  const retirer = async () => {
    setEnCours(true)
    const resultat = await inject(RETIRER_UN_MEMBRE_ACTION_KEY)({
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
      message: `${nomAffiche} a bien été retiré de votre équipe`,
    })
  }

  return (
    <>
      {estMonte &&
        createPortal(
          <Modale
            title={`Retirer '${nomAffiche}' de mon équipe`}
            buttons={[
              { children: 'Annuler', priority: 'secondary', onClick: close },
              {
                children: 'Retirer de mon équipe',
                onClick: retirer,
                ...buttonLoadingClassname(enCours),
              },
            ]}
          >
            Êtes-vous sûr de vouloir retirer ‘{nomAffiche}’ de votre
            équipe&nbsp;?
            <Notice
              className="fr-notice--flex fr-mt-4v"
              title={
                <span className="fr-text--left fr-text-default--grey fr-text--regular">
                  Vous n’aurez plus accès aux prochaines activités et
                  statistiques enregistrés{' '}
                  <b>
                    à partir du moment où vous aurez retiré ‘{nomAffiche}’ de
                    votre équipe.
                  </b>
                  <br />
                  <br />
                  Vous conserverez uniquement l’accès à ses activités et
                  statistiques archivés <b>jusqu’à ce jour.</b>
                </span>
              }
            />
          </Modale>,
          document.body,
        )}
      <Button
        title="Retirer ce membre de mon équipe"
        size="small"
        priority="tertiary"
        {...buttonProps}
        {...buttonLoadingClassname(
          enCours,
          'fr-text-default--error fr-position-relative fr-index-10',
        )}
      >
        <span className="ri-user-unfollow-line" aria-hidden />
      </Button>
    </>
  )
}

export default BoutonRetirerUnMembre
