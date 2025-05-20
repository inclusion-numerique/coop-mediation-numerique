'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'

const UpdateInfo = () => {
  const mutation = trpc.conum.updateInfo.useMutation()

  const handleAction = async () => {
    try {
      await mutation.mutateAsync()

      createToast({
        priority: 'success',
        message:
          'Mise à jour des informations des conseillers numériques effectuée',
      })
    } catch {
      createToast({
        priority: 'error',
        message:
          'Échec de la mise à jour des informations des conseillers numériques',
      })
    }
  }

  return (
    <div className="fr-grid-row fr-flex-gap-4v">
      <div className="fr-col">
        <h4 className="fr-h6 fr-mb-2v">
          Mettre à jour les informations des conseillers numériques
        </h4>
        <p className="fr-text--sm fr-mb-0">
          Cette action complète les données des conseillers numériques à partir
          des informations officielles fournies par Conum&nbsp;:
        </p>
        <ul className="fr-text--sm fr-mb-0">
          <li>En ajoutant les identifiants manquants (idPg)</li>
          <li>En mettant à jour la visibilité sur la cartographie nationale</li>
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

export default withTrpc(UpdateInfo)
