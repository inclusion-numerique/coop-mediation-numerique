'use client'
import { useModalVisibility } from '@app/ui/hooks/useModalVisibility'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { declencherSynchronisationAction } from '@app/web/app/_actions/rdvsp/declencher-synchronisation.action'
import { deconnecterCompteRdvAction } from '@app/web/app/_actions/rdvsp/deconnecter-compte-rdv.action'
import {
  getRdvOauthIntegrationStatus,
  type RdvOauthIntegrationStatus,
} from '@app/web/rdv-service-public/rdvIntegrationOauthStatus'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { dateAsDayAndTimeInTimeZone } from '@app/web/utils/dateAsDayAndTime'
import type { UserId, UserRdvAccount, UserTimezone } from '@app/web/utils/user'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Tag from '@codegouvfr/react-dsfr/Tag'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import RdvServicePublicStatusTag from './RdvServicePublicStatusTag'

export const GererRdvServicePublicModalInstance = createModal({
  id: 'gerer-rdv-service-public',
  isOpenedByDefault: false,
})

const GererRdvServicePublicModal = ({
  user: { rdvAccount, timezone, id: userId },
}: {
  user: UserRdvAccount & UserTimezone & UserId
}) => {
  const router = useRouter()

  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false)
  const [synchronisationEnCours, setSynchronisationEnCours] = useState(false)
  const [state, setState] = useState<'gerer' | 'deconnecter'>('gerer')

  const [status, setStatus] = useState<RdvOauthIntegrationStatus>(
    getRdvOauthIntegrationStatus({ user: { rdvAccount } }),
  )

  const [lastSynced, setLastSynced] = useState<Date | null>(
    rdvAccount?.lastSynced ? new Date(rdvAccount.lastSynced) : null,
  )
  const [error, setError] = useState<string | null>(rdvAccount?.error || null)

  const reset = () => {
    setState('gerer')
  }

  const onDelete = () => {
    setState('deconnecter')
  }

  const onConfirmDelete = async () => {
    setDeconnexionEnCours(true)
    const result = await deconnecterCompteRdvAction()

    if (!result.success) {
      setDeconnexionEnCours(false)
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de la déconnexion de votre compte RDV Service Public.',
      })
      return
    }

    createToast({
      priority: 'success',
      message: `Votre compte RDV Service Public a bien été déconnecté.`,
    })
    router.refresh()
  }

  const onSync = async () => {
    setSynchronisationEnCours(true)

    const resultat = await declencherSynchronisationAction({
      utilisateurId: userId,
    })

    setSynchronisationEnCours(false)

    // La modale garde son propre état : ses données viennent de props figées au
    // rendu, qu'un `router.refresh()` ne remplacerait pas tant qu'elle est
    // montée.
    if (!resultat.success) {
      setError(resultat.error)
      setStatus('error')
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    // Nulle quand la passe était sans objet : mieux vaut garder la date affichée
    // que prétendre qu'aucune synchronisation n'a jamais eu lieu.
    if (resultat.data.synchroniseeLe !== null) {
      setLastSynced(resultat.data.synchroniseeLe)
    }

    setError(null)
    setStatus('success')
    createToast({
      priority: 'success',
      message: 'Les informations ont été synchronisées avec succès.',
    })
  }

  useModalVisibility(GererRdvServicePublicModalInstance.id, {
    onClosed: reset,
  })

  const isLoading = deconnexionEnCours || synchronisationEnCours

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
            <RdvServicePublicStatusTag status={status} />
          </div>
          <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mt-8v">
            <p className="fr-mb-0 fr-text-mention--grey">
              Dernière synchronisation
            </p>
            <Tag>
              {lastSynced
                ? dateAsDayAndTimeInTimeZone(lastSynced, timezone)
                : 'Aucune synchronisation'}
            </Tag>
          </div>
          {error && (
            <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mt-8v">
              <p className="fr-mb-0 fr-text-mention--grey">Erreur</p>
              <p className="fr-text--sm fr-mb-0">{error}</p>
            </div>
          )}
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
            {isLoading && (
              <p className="fr-text--sm fr-mb-0">
                La synchronisation peut prendre jusqu'à 2 minutes, merci de
                patienter...
              </p>
            )}
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

export default GererRdvServicePublicModal
