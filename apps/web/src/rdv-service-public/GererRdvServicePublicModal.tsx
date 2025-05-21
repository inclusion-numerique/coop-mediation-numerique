'use client'
import { useModalVisibility } from '@app/ui/hooks/useModalVisibility'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import type { UserRdvAccount } from '@app/web/utils/user'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Tag from '@codegouvfr/react-dsfr/Tag'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { dateAsDay } from '../utils/dateAsDay'
import { dateAsDayAndTime } from '../utils/dateAsDayAndTime'

export const GererRdvServicePublicModalInstance = createModal({
  id: 'gerer-rdv-service-public',
  isOpenedByDefault: false,
})

const GererRdvServicePublicModal = ({
  user: { rdvAccount },
}: { user: UserRdvAccount }) => {
  const deleteMutation = trpc.rdvServicePublic.deleteRdvAccount.useMutation()
  const syncMutation = trpc.rdvServicePublic.syncRdvAccountData.useMutation()
  const router = useRouter()

  const [state, setState] = useState<'gerer' | 'deconnecter'>('gerer')

  const reset = () => {
    setState('gerer')
  }

  const onDelete = () => {
    setState('deconnecter')
  }

  const onConfirmDelete = async () => {
    await deleteMutation.mutateAsync()
    createToast({
      priority: 'success',
      message: `Votre compte RDV Service Public a bien été déconnecté.`,
    })
    router.refresh()
  }

  const onSync = async () => {
    await syncMutation.mutateAsync()
    createToast({
      priority: 'success',
      message: `Les informations ont été synchronisées avec succès.`,
    })
  }

  useModalVisibility(GererRdvServicePublicModalInstance.id, {
    onClosed: reset,
  })

  const isLoading =
    deleteMutation.isPending ||
    deleteMutation.isSuccess ||
    syncMutation.isPending

  const title =
    state === 'gerer' ? (
      <>
        <span className="fr-icon-arrow-right-line fr-icon--lg fr-mr-2v" />
        Intégration avec RDV Service Public
      </>
    ) : (
      'Déconnecter l’intégration à RDV service Public'
    )

  if (!rdvAccount || !rdvAccount.created) {
    return null
  }

  return (
    <GererRdvServicePublicModalInstance.Component
      title={title}
      buttons={
        state === 'gerer'
          ? [
              {
                title: 'Déconnecter l’intégration',
                doClosesModal: false,
                className: 'fr-btn--danger',
                disabled: isLoading,
                children: 'Déconnecter l’intégration',
                type: 'button',
                onClick: onDelete,
              },
            ]
          : [
              {
                title: 'Annuler',
                priority: 'secondary',
                doClosesModal: true,
                children: 'Annuler',
                type: 'button',
                disabled: isLoading,
                onClick: reset,
              },
              {
                title: 'Déconnecter',
                doClosesModal: false,
                className: classNames(
                  'fr-btn--danger',
                  isLoading && 'fr-btn--loading',
                ),
                children: 'Déconnecter',
                type: 'button',
                onClick: onConfirmDelete,
              },
            ]
      }
    >
      {state === 'gerer' && (
        <>
          <p>Gérer la connexion avec votre intégration</p>
          <hr className="fr-separator-8v" />
          <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v">
            <p className="fr-mb-0 fr-text-mention--grey">
              Date de la connexion
            </p>
            <p className="fr-text--sm fr-mb-0">
              {dateAsDay(new Date(rdvAccount.created))}
            </p>
          </div>
          <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mt-8v">
            <p className="fr-mb-0 fr-text-mention--grey">
              Statut de la connexion
            </p>
            <Tag
              iconId="fr-icon-check-line"
              className="fr-background-contrast--success fr-text-default--success"
            >
              Compte connecté
            </Tag>
          </div>
          <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mt-8v">
            <p className="fr-mb-0 fr-text-mention--grey">
              Dernière synchronisation
            </p>
            <Tag>
              {rdvAccount.lastSynced
                ? dateAsDayAndTime(new Date(rdvAccount.lastSynced))
                : 'Aucune synchronisation'}
            </Tag>
          </div>
          <div className="fr-btns-group fr-btns-group--icon-left fr-mt-8v fr-mb-8v">
            <Button
              type="button"
              priority="primary"
              iconId="fr-icon-refresh-line"
              onClick={onSync}
              {...buttonLoadingClassname(isLoading)}
            >
              Synchroniser les infos avec RDV Service Public
            </Button>
          </div>
          <hr className="fr-separator-1px" />
        </>
      )}
      {state === 'deconnecter' && (
        <>
          <p className="fr-mb-4v">
            En déconnectant votre compte RDV Service Public, vous n’aurez plus
            accès aux fonctionnalités de RDV Service Public intégrées dans La
            Coop de la médiation numérique.
          </p>
          <Notice title="Vous pourrez toujours reconnecter votre compte plus tard." />
        </>
      )}
    </GererRdvServicePublicModalInstance.Component>
  )
}

export default withTrpc(GererRdvServicePublicModal)
