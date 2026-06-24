'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { normaliserTelephonesBeneficiairesAction } from '@app/web/app/_actions/beneficiaire/normaliser-telephones-beneficiaires.action'
import Button from '@codegouvfr/react-dsfr/Button'
import { useState } from 'react'

const NormaliserTelephonesBeneficiaires = () => {
  const [pending, setPending] = useState(false)

  const handleAction = async () => {
    setPending(true)
    const result = await normaliserTelephonesBeneficiairesAction()
    setPending(false)

    createToast(
      result.success
        ? {
            priority: 'success',
            message: 'Normalisation des téléphones bénéficiaires lancée',
          }
        : {
            priority: 'error',
            message: 'Échec de la normalisation des téléphones bénéficiaires',
          },
    )
  }

  return (
    <div className="fr-grid-row fr-flex-gap-4v">
      <div className="fr-col">
        <h4 className="fr-h6 fr-mb-2v">
          Normaliser les téléphones des bénéficiaires
        </h4>
        <p className="fr-text--sm fr-mb-0">
          Convertit les numéros existants au format international (+33…)&nbsp;—
          la forme canonique stockée en base. Opération idempotente&nbsp;: seuls
          les numéros non conformes sont modifiés, les numéros invalides sont
          ignorés.
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

export default NormaliserTelephonesBeneficiaires
