'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import type { RdvListItem } from '@app/web/features/rdvsp/administration/db/rdvQueries'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import styles from './RdvStatusUpdateModal.module.css'

export type RdvStatusUpdateDynamicModalState = {
  rdv: RdvListItem
}

export const RdvStatusUpdateDynamicModal = createDynamicModal({
  id: 'rdv-status-update',
  isOpenedByDefault: false,
  initialState: null as null | RdvStatusUpdateDynamicModalState,
})

const RdvStatusUpdateModal = ({
  initialState,
}: {
  initialState?: RdvStatusUpdateDynamicModalState
}) => {
  const state = RdvStatusUpdateDynamicModal.useState() ?? initialState
  const router = useRouter()

  const updateStatusMutation =
    trpc.rdvServicePublic.updateRdvStatus.useMutation()
  const createActiviteMutation =
    trpc.rdvServicePublic.createActiviteFromRdv.useMutation()

  if (!state) return null

  const { rdv } = state
  const isCollectif = rdv.motif?.collectif ?? false

  const handleCreateCra = async () => {
    try {
      const { createCraUrl } = await createActiviteMutation.mutateAsync({
        rdvId: rdv.id,
      })
      RdvStatusUpdateDynamicModal.close()
      router.push(createCraUrl)
    } catch {
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la création du CRA',
      })
      createActiviteMutation.reset()
    }
  }

  const handleUpdateStatus = async (
    status: 'noshow' | 'excused' | 'revoked' | 'seen',
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        rdvId: rdv.id,
        status,
      })
      RdvStatusUpdateDynamicModal.close()
      router.refresh()
      createToast({
        priority: 'success',
        message: 'Le statut du RDV a été mis à jour',
      })
    } catch {
      createToast({
        priority: 'error',
        message: 'Une erreur est survenue lors de la mise à jour du statut',
      })
      updateStatusMutation.reset()
    }
  }

  const isLoading =
    updateStatusMutation.isPending ||
    updateStatusMutation.isSuccess ||
    createActiviteMutation.isPending ||
    createActiviteMutation.isSuccess

  return (
    <RdvStatusUpdateDynamicModal.Component
      title={
        isCollectif
          ? 'Renseignez le statut du RDV collectif passé'
          : 'Renseignez le statut du RDV passé'
      }
    >
      <div className="fr-flex fr-direction-column fr-flex-gap-6v">
        <div className="fr-border fr-border-radius--8 fr-p-3w fr-mt-1w">
          <div className="fr-flex fr-align-items-center fr-flex-gap-3v">
            <div
              className={classNames(
                styles.sectionIcon,
                styles.sectionIconHonored,
              )}
            >
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
              <span
                className={classNames(
                  'fr-icon-edit-line',
                  styles.actionItemIcon,
                )}
              />
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
              J'ai déjà renseigné un CRA pour ce RDV
              <span
                className={classNames(
                  'ri-file-check-line',
                  styles.actionItemIcon,
                )}
              />
            </div>
          </Button>
        </div>

        {isCollectif ? (
          <Button
            priority="tertiary no outline"
            onClick={() => handleUpdateStatus('revoked')}
            {...buttonLoadingClassname(
              isLoading,
              classNames(
                styles.cancelCollectifButton,
                'fr-border fr-border-radius--8 fr-p-3w fr-width-full',
              ),
            )}
          >
            <div className="fr-flex fr-flex-gap-3v fr-width-full">
              <div
                className={classNames(
                  styles.sectionIcon,
                  styles.sectionIconNotHonored,
                )}
              >
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
              <div
                className={classNames(
                  styles.sectionIcon,
                  styles.sectionIconNotHonored,
                )}
              >
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
                  className={classNames(
                    'ri-user-forbid-line',
                    styles.actionItemIcon,
                  )}
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
                  className={classNames(
                    'ri-user-unfollow-line',
                    styles.actionItemIcon,
                  )}
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
                  className={classNames(
                    'ri-calendar-close-line',
                    styles.actionItemIcon,
                  )}
                  aria-hidden
                />
              </div>
            </Button>
          </div>
        )}
      </div>
    </RdvStatusUpdateDynamicModal.Component>
  )
}

export default withTrpc(RdvStatusUpdateModal)
