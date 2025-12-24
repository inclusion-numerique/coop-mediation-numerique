'use client'

import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch'
import { useRouter } from 'next/navigation'

const PartageStatistiquesModal = createModal({
  id: 'partage-statistiques',
  isOpenedByDefault: false,
})

const PartageStatistiques = ({ shareId }: { shareId?: string }) => {
  const router = useRouter()
  const mutation = trpc.mediateur.shareStats.useMutation()
  const shared = shareId != null

  const handleTogglePartage = async () => {
    try {
      const isActive = await mutation.mutateAsync()
      router.refresh()

      createToast({
        priority: 'success',
        message: isActive
          ? 'Lien de partage activé'
          : 'Lien de partage désactivé',
      })

      if (!isActive) PartageStatistiquesModal.close()
    } catch {
      createToast({
        priority: 'error',
        message:
          'Erreur lors de la modification du partage des statistiques. Veuillez réessayer.',
      })
    }
  }

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/statistiques/${shareId}`
      await navigator.clipboard.writeText(url)
      createToast({
        priority: 'success',
        message: 'Lien copié dans le presse-papier.',
      })
      PartageStatistiquesModal.close()
    } catch {
      createToast({
        priority: 'error',
        message: 'Impossible de copier le lien dans le presse-papier.',
      })
    }
  }

  return (
    <>
      <div className="fr-position-relative">
        <Button
          {...PartageStatistiquesModal.buttonProps}
          title={`${shared ? 'Desactiver' : 'Activer'} le partage de mes statistiques`}
          priority="secondary"
          iconId="fr-icon-link"
        ></Button>
        {shared && (
          <div
            aria-hidden={true}
            className="fr-background-default--grey fr-position-absolute fr-top-0 fr-right-0 fr-icon fr-mr-n2v fr-mt-n2v fr-flex fr-align-items-center fr-border-radius--8"
            style={{ height: '18px' }}
          >
            <span className="ri-checkbox-circle-fill fr-text-default--success" />
          </div>
        )}
      </div>
      <PartageStatistiquesModal.Component title="Partager vos statistiques via un lien">
        <div className="fr-flex fr-flex-gap-6v fr-align-items-center fr-border fr-border-radius--4 fr-my-8v fr-px-6v fr-py-4v">
          {shared ? (
            <>
              <div
                className="fr-background-contrast--success fr-p-4v fr-border-radius--8 fr-display-inline-block"
                aria-hidden
              >
                <span className="ri-earth-fill ri-lg fr-line-height-1 fr-text-default--success" />
              </div>
              <div>
                Lien de partage public activé
                <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
                  Tous les internautes disposant du lien peuvent consulter vos
                  statistiques et utiliser les filtres et les exports
                </p>
              </div>
            </>
          ) : (
            <>
              <div
                className="fr-background-contrast--grey fr-p-4v fr-border-radius--8 fr-display-inline-block"
                aria-hidden
              >
                <span className="ri-link-unlink ri-lg fr-line-height-1 fr-text-disabled-grey" />
              </div>
              <div className="fr-flex-1">
                Lien de partage public désactivé
                <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
                  Vos statistiques ne sont pas consultables par lien
                </p>
              </div>
            </>
          )}
          <ToggleSwitch
            disabled={mutation.isPending}
            label={null}
            checked={shared}
            labelPosition="left"
            showCheckedHint={false}
            onChange={handleTogglePartage}
          />
        </div>
        <Button
          disabled={!shared}
          iconId="fr-icon-link"
          iconPosition="right"
          size="large"
          className="fr-width-full fr-justify-content-center"
          onClick={handleCopy}
        >
          Copier le lien
        </Button>
      </PartageStatistiquesModal.Component>
    </>
  )
}

export default withTrpc(PartageStatistiques)
