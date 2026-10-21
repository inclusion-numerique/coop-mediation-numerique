'use client'

import { createToast } from '@app/ui/toast/createToast'
import type { LienDePartageId } from '@app/web/features/mediateurs/domain'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY } from '../action/regler-le-partage-statistiques.key'

const PartageStatistiquesModal = createModal({
  id: 'partage-statistiques',
  isOpenedByDefault: false,
})

export const PartageStatistiques = ({
  lien,
}: {
  lien: LienDePartageId | null
}) => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()
  const shared = lien !== null

  const handleTogglePartage = () =>
    demarrer(async () => {
      const actif = !shared
      const resultat = await inject(REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY)({
        actif,
      })

      if (!resultat.success) {
        createToast({
          priority: 'error',
          message:
            'Erreur lors de la modification du partage des statistiques. Veuillez réessayer.',
        })
        return
      }

      router.refresh()

      createToast({
        priority: 'success',
        message: actif ? 'Lien de partage activé' : 'Lien de partage désactivé',
      })

      if (!actif) PartageStatistiquesModal.close()
    })

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/statistiques/${lien}`
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
            disabled={enCours}
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
