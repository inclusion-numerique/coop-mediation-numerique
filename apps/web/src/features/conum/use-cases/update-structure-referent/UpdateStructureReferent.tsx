'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'

const UpdateStructureReferent = () => {
  const mutation = trpc.conum.updateStructureReferent.useMutation()

  const handleAction = async () => {
    try {
      await mutation.mutateAsync()

      createToast({
        priority: 'success',
        message: 'Mise à jour des référents de structure effectuée',
      })
    } catch {
      createToast({
        priority: 'error',
        message: 'Échec de la mise à jour des référents de structure',
      })
    }
  }

  return (
    <div className="fr-grid-row fr-flex-gap-4v">
      <div className="fr-col">
        <h4 className="fr-h6 fr-mb-2v">
          Mettre à jour les référents des structures
        </h4>
        <p className="fr-text--sm fr-mb-0">
          Cette action cherche automatiquement les conseillers numériques pour
          lesquels la structure employeuse n’a pas encore de référent renseigné.
          Elle tente ensuite de retrouver les informations de mise en relation
          correspondantes dans les données Conum, afin de compléter le référent
          manquant.
        </p>
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

export default withTrpc(UpdateStructureReferent)
