'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '../action/mettre-a-jour-statut-rdv.key'
import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from './creer-activite-depuis-rdv.key'

export type RdvASaisir = {
  readonly id: number
  readonly collectif: boolean
}

export const SaisieDuStatutDuRdvDynamicModal =
  createDynamicModal<RdvASaisir | null>({
    id: 'rdv-status-update',
    isOpenedByDefault: false,
    initialState: null,
  })

export const useOuvrirLaSaisieDuStatut = (): ((rdv: RdvASaisir) => void) =>
  SaisieDuStatutDuRdvDynamicModal.useOpen()

const SaisieDuStatutDuRdv = ({
  initialState,
}: {
  initialState?: RdvASaisir
}) => {
  const rdv = SaisieDuStatutDuRdvDynamicModal.useState() ?? initialState
  const router = useRouter()

  const [miseAJourEnCours, setMiseAJourEnCours] = useState(false)
  const [preparationCraEnCours, setPreparationCraEnCours] = useState(false)

  if (!rdv) return null

  const isCollectif = rdv.collectif

  const handleCreateCra = async () => {
    setPreparationCraEnCours(true)
    const result = await inject(CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY)({
      rdvId: rdv.id,
    })

    if (!result.success) {
      setPreparationCraEnCours(false)
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la création du CRA',
      })
      return
    }

    SaisieDuStatutDuRdvDynamicModal.close()
    router.push(result.data.urlCreationCra)
  }

  const handleUpdateStatus = async (
    statut: 'noshow' | 'excused' | 'revoked' | 'seen',
  ) => {
    setMiseAJourEnCours(true)
    const result = await inject(METTRE_A_JOUR_STATUT_RDV_ACTION_KEY)({
      rdvId: rdv.id,
      statut,
    })

    if (!result.success) {
      setMiseAJourEnCours(false)
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la mise à jour du statut',
      })
      return
    }

    SaisieDuStatutDuRdvDynamicModal.close()
    router.refresh()
    createToast({
      priority: 'success',
      message: 'Le statut du RDV a été mis à jour',
    })
  }

  const isLoading = miseAJourEnCours || preparationCraEnCours

  return (
    <SaisieDuStatutDuRdvDynamicModal.Component
      title={
        isCollectif
          ? 'Renseignez le statut du RDV collectif passé'
          : 'Renseignez le statut du RDV passé'
      }
    >
      <div className="fr-flex fr-direction-column fr-flex-gap-6v">
        <div className="fr-border fr-border-radius--8 fr-p-3w fr-mt-1w">
          <div className="fr-flex fr-align-items-center fr-flex-gap-3v">
            <div className="saisie-du-statut-rdv__icone saisie-du-statut-rdv__icone--honore">
              <span className="fr-icon-calendar-check-fill" />
            </div>
            <div>
              <p className="fr-mb-0">
                {isCollectif
                  ? 'Rendez-vous collectif honoré'
                  : 'Rendez-vous honoré'}
              </p>
              <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
                {isCollectif
                  ? 'Le rendez-vous collectif a eu lieu'
                  : "Le bénéficiaire s'est présenté à son rendez-vous et a été reçu."}
              </p>
            </div>
          </div>

          <hr className="fr-separator fr-separator-1px fr-my-2w" />
          <Button
            className="fr-py-1w fr-width-full"
            priority="tertiary no outline"
            onClick={handleCreateCra}
            type="button"
          >
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-width-full">
              Renseigner un CRA pour ce RDV
              <span className="fr-icon-edit-line saisie-du-statut-rdv__icone-d-action" />
            </div>
          </Button>
          <hr className="fr-separator fr-separator-1px fr-my-2w" />
          <Button
            className="fr-py-1w fr-width-full"
            priority="tertiary no outline"
            type="button"
            onClick={() => handleUpdateStatus('seen')}
          >
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-width-full">
              Je ne souhaite pas compléter de CRA pour ce RDV
              <span className="ri-file-check-line saisie-du-statut-rdv__icone-d-action" />
            </div>
          </Button>
        </div>

        {isCollectif ? (
          <Button
            priority="tertiary no outline"
            onClick={() => handleUpdateStatus('revoked')}
            {...buttonLoadingClassname(
              isLoading,
              'saisie-du-statut-rdv__annulation-collective fr-border fr-border-radius--8 fr-p-3w fr-width-full',
            )}
          >
            <div className="fr-flex fr-flex-gap-3v fr-width-full">
              <div className="saisie-du-statut-rdv__icone saisie-du-statut-rdv__icone--non-honore">
                <span
                  className="fr-icon-calendar-close-fill fr-icon--sm"
                  aria-hidden
                />
              </div>
              <div>
                <p className="fr-mb-0">Rendez-vous collectif annulé</p>
                <p className="fr-text--xs fr-text-mention--grey fr-mb-0 fr-text--left">
                  Le rendez-vous a dû être annulé
                </p>
              </div>
            </div>
          </Button>
        ) : (
          <div className="fr-border fr-border-radius--8 fr-p-3w">
            <div className="fr-flex fr-align-items-center fr-flex-gap-3v">
              <div className="saisie-du-statut-rdv__icone saisie-du-statut-rdv__icone--non-honore">
                <span
                  className="fr-icon-calendar-close-fill fr-icon--sm"
                  aria-hidden
                />
              </div>
              <div>
                <p className="fr-mb-0">Le RDV n'a pas pu être honoré</p>
                <p className="fr-text--xs fr-text-mention--grey fr-mb-0">
                  Sélectionnez le motif
                </p>
              </div>
            </div>

            <hr className="fr-separator fr-separator-1px fr-my-2w" />
            <Button
              className="fr-py-1w fr-width-full"
              priority="tertiary no outline"
              onClick={() => handleUpdateStatus('noshow')}
              type="button"
            >
              <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-width-full">
                Absence non excusée
                <span
                  className="ri-user-forbid-line saisie-du-statut-rdv__icone-d-action"
                  aria-hidden
                />
              </div>
            </Button>
            <hr className="fr-separator fr-separator-1px fr-my-2w" />

            <Button
              className="fr-py-1w fr-width-full"
              priority="tertiary no outline"
              onClick={() => handleUpdateStatus('excused')}
              type="button"
            >
              <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-width-full">
                Rendez-vous annulé à l'initiative du bénéficiaire
                <span
                  className="ri-user-unfollow-line saisie-du-statut-rdv__icone-d-action"
                  aria-hidden
                />
              </div>
            </Button>
            <hr className="fr-separator fr-separator-1px fr-my-2w" />

            <Button
              className="fr-py-1w fr-width-full"
              priority="tertiary no outline"
              onClick={() => handleUpdateStatus('revoked')}
              type="button"
            >
              <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-width-full">
                Rendez-vous annulé à l'initiative du service
                <span
                  className="ri-calendar-close-line saisie-du-statut-rdv__icone-d-action"
                  aria-hidden
                />
              </div>
            </Button>
          </div>
        )}
      </div>
    </SaisieDuStatutDuRdvDynamicModal.Component>
  )
}

export default SaisieDuStatutDuRdv
