'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'

const SyncProfiles = () => {
  const mutation = trpc.conum.syncProfiles.useMutation()

  const handleAction = async () => {
    try {
      await mutation.mutateAsync()

      createToast({
        priority: 'success',
        message:
          'Synchronisation des profiles conseiller et coordinateur effectuée',
      })
    } catch {
      createToast({
        priority: 'error',
        message:
          'Échec de la synchronisation des profiles conseiller et coordinateur',
      })
    }
  }

  return (
    <div className="fr-grid-row fr-flex-gap-4v">
      <div className="fr-col">
        <h4 className="fr-h6 fr-mb-2v">
          Synchroniser les profiles conseiller et coordinateur
        </h4>
        <p className="fr-text--sm fr-mb-0">
          Cette action compare les données internes avec les données Conum
          officielles pour&nbsp;:
        </p>
        <ul className="fr-text--sm fr-mb-0">
          <li>
            Créer ou mettre à jour les profils des conseillers numériques en
            vérifiant les adresses email professionnelles.
          </li>
          <li>
            Créer ou mettre à jour les profils des coordinateurs de conseillers
            numériques en vérifiant les adresses email professionnelles.
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

export default withTrpc(SyncProfiles)
