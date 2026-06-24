'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { normaliserBeneficiairesAction } from '@app/web/app/_actions/beneficiaire/normaliser-beneficiaires.action'
import Button from '@codegouvfr/react-dsfr/Button'
import { useState } from 'react'

const NormaliserBeneficiaires = () => {
  const [pending, setPending] = useState(false)

  const handleAction = async () => {
    setPending(true)
    const result = await normaliserBeneficiairesAction()
    setPending(false)

    createToast(
      result.success
        ? {
            priority: 'success',
            message: 'Normalisation des données bénéficiaires lancée',
          }
        : {
            priority: 'error',
            message: 'Échec de la normalisation des données bénéficiaires',
          },
    )
  }

  return (
    <div className="fr-grid-row fr-flex-gap-4v">
      <div className="fr-col">
        <h4 className="fr-h6 fr-mb-2v">
          Normaliser les données des bénéficiaires
        </h4>
        <p className="fr-text--sm fr-mb-0">
          Re-canonicalise les fiches existantes&nbsp;: téléphone au format
          international, e-mail en minuscules, codes postal/INSEE sans espaces.
          Opération idempotente&nbsp;: seules les fiches non conformes sont
          modifiées (sans toucher à leur date de modification), les fiches avec
          une donnée invalide sont ignorées et journalisées.
        </p>
      </div>
      <div className="fr-col-lg-auto fr-col-12">
        <Button
          type="button"
          iconId="fr-icon-play-line"
          size="small"
          priority="secondary"
          onClick={handleAction}
          disabled={pending}
          {...buttonLoadingClassname(pending)}
        >
          Lancer l’action
        </Button>
      </div>
    </div>
  )
}

export default NormaliserBeneficiaires
