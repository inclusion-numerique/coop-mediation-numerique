'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import BackButton from '@app/web/components/BackButton'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import type { ActeurForList } from '@app/web/features/mon-reseau/use-cases/acteurs/db/searchActeurs'
import UserPublicActivityStatusBadge from '@app/web/features/utilisateurs/components/UserPublicActivityStatusBadge'
import { getUserPublicActivityStatus } from '@app/web/features/utilisateurs/utils/getUserPublicActivityStatus'
import { trpc } from '@app/web/trpc'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { ButtonProps } from '@codegouvfr/react-dsfr/Button'
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import React from 'react'
import { ActeurDetailPageData } from '../getActeurDetailPageData'
import ActeurProfilAndContact from './ActeurProfilAndContact'

export type ActeurIdentityData = Omit<
  ActeurForList,
  'mediateur' | 'coordinateur'
> & {
  mediateur: Pick<
    NonNullable<ActeurForList['mediateur']>,
    'id' | 'conseillerNumerique'
  > | null
  coordinateur: Pick<
    NonNullable<ActeurForList['coordinateur']>,
    'id' | 'conseillerNumeriqueId'
  > | null
}

const ActeurIdentity = ({
  displayName,
  acteur,
  coordinationFeatures,
  creation,
  lastActivityDate,
  retourHref,
  retourLabel,
  removeFromTeamSuccessHref,
}: {
  acteur: ActeurIdentityData
  displayName: string
  coordinationFeatures: ActeurDetailPageData['coordinationFeatures']
  creation: Date
  lastActivityDate: Date | null
  retourHref: string
  retourLabel: string
  removeFromTeamSuccessHref: string | null
}) => {
  const { mediateur, email } = acteur

  const {
    Component: RemoveFromTeamModal,
    close: closeRemoveFromTeamModal,
    buttonProps: removeFromTeamModalNativeButtonProps,
  } = createModal({
    id: 'remove-from-team-modal',
    isOpenedByDefault: false,
  })

  const {
    Component: InviteToTeamModal,
    close: closeInviteToTeamModal,
    buttonProps: inviteToTeamModalNativeButtonProps,
  } = createModal({
    id: 'invite-to-team-modal',
    isOpenedByDefault: false,
  })

  const router = useRouter()
  const removeFromTeamMutation = trpc.mediateur.removeFromTeam.useMutation()
  const inviteToTeamMutation = trpc.mediateur.invite.useMutation()

  const mediateurId = mediateur?.id

  const {
    canRemoveFromTeam,
    canInviteToTeam,
    canRemoveFromArchives: _canRemoveFromArchives,
    acteurIsInvitedToTeam,
  } = coordinationFeatures
  const onRemoveFromTeam = async () => {
    if (!mediateurId) {
      return
    }
    try {
      await removeFromTeamMutation.mutateAsync({ mediateurId })
      if (removeFromTeamSuccessHref != null) {
        router.push(retourHref)
      }
      router.refresh()
      createToast({
        priority: 'success',
        message: `${displayName} a bien été retiré de votre équipe`,
      })
    } catch {
      createToast({
        priority: 'error',
        message: `Une erreur est survenue lors de la suppression de ${displayName} de votre équipe, veuillez réessayer ultérieurement.`,
      })
    }
  }

  const onInviteToTeam = async () => {
    try {
      await inviteToTeamMutation.mutateAsync({
        members: [
          {
            email,
            mediateurId,
            nom: displayName,
          },
        ],
      })
      closeInviteToTeamModal()
      createToast({
        priority: 'success',
        message: `${displayName} a bien été invité à votre équipe`,
      })
      router.refresh()
    } catch {
      closeInviteToTeamModal()
      createToast({
        priority: 'error',
        message: `Une erreur est survenue lors de l'invitation de ${displayName} à votre équipe, veuillez réessayer ultérieurement.`,
      })
    }
  }

  const actionButtons: [ButtonProps, ...ButtonProps[]] = [
    {
      className: 'fr-mb-0',
      children: (
        <span className="fr-flex fr-flex-gap-2v">
          <span className="ri-mail-line" aria-hidden />
          Contacter par email
        </span>
      ),
      title: 'Contacter par email - client mail',
      linkProps: { href: `mailto:${email}` },
      priority: 'tertiary' as const,
    },
  ]

  if (canRemoveFromTeam) {
    actionButtons.unshift({
      type: 'button',
      children: (
        <span className="fr-flex fr-flex-gap-2v fr-text-default--error ">
          <span className="ri-user-unfollow-line" aria-hidden />
          Retirer de mon équipe
        </span>
      ),
      priority: 'tertiary' as const,
      ...removeFromTeamModalNativeButtonProps,
      ...buttonLoadingClassname(
        removeFromTeamMutation.isPending || removeFromTeamMutation.isSuccess,
        'fr-mb-0',
      ),
    })
  }

  if (canInviteToTeam) {
    actionButtons.unshift({
      type: 'button',
      children: (
        <span className="fr-flex fr-flex-gap-2v">
          <span className="ri-user-add-line" aria-hidden />
          Inviter dans mon équipe
        </span>
      ),
      priority: 'primary' as const,
      ...inviteToTeamModalNativeButtonProps,
      ...buttonLoadingClassname(
        inviteToTeamMutation.isPending || inviteToTeamMutation.isSuccess,
        'fr-mb-0',
      ),
    })
  }

  if (acteurIsInvitedToTeam) {
    actionButtons.unshift({
      type: 'button',
      disabled: true,
      children: (
        <span className="fr-flex fr-flex-gap-2v">
          <span className="ri-user-add-line" aria-hidden />
          Invitation envoyée le{' '}
          {dateAsDay(
            coordinationFeatures.coordinationDetails?.invitation?.creation,
          )}
        </span>
      ),
      priority: 'tertiary' as const,
      className: 'fr-mb-0',
    })
  }

  return (
    <>
      <RemoveFromTeamModal
        title={`Retirer ‘${displayName}’ de mon équipe`}
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: closeRemoveFromTeamModal,
          },
          {
            className: 'fr-background-action-high--error',
            children: 'Retirer de mon équipe',
            onClick: onRemoveFromTeam,
          },
        ]}
      >
        Êtes-vous sûr de vouloir retirer ce médiateur numérique de votre
        équipe&nbsp;? Vous n’aurez plus accès à ses informations de profil ainsi
        qu’à ses statistiques.
      </RemoveFromTeamModal>
      <InviteToTeamModal
        title={`Inviter "${displayName}" à rejoindre votre équipe de coordination.`}
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: closeInviteToTeamModal,
          },
          {
            children: "Envoyer l'invitation",
            onClick: onInviteToTeam,
            ...buttonLoadingClassname(inviteToTeamMutation.isPending),
          },
        ]}
      >
        <strong>{displayName}</strong> va recevoir une invitation par mail.
      </InviteToTeamModal>
      <BackButton href={retourHref}>{retourLabel}</BackButton>
      <div className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v">
        <div className="fr-flex fr-direction-column">
          <div className="fr-flex fr-align-items-center">
            <p className="fr-mb-0 fr-text-mention--grey fr-text--sm">
              Profil créé le {dateAsDay(creation)}  ·  
            </p>
            <UserPublicActivityStatusBadge
              status={getUserPublicActivityStatus({
                lastActivityDate,
              })}
            />
          </div>
          <h1 className="fr-h2 fr-page-title fr-mb-3v">{displayName}</h1>
          <ActeurProfilAndContact acteur={acteur} />
        </div>
      </div>
      <ButtonsGroup
        className="fr-mt-2v fr-mb-12v"
        buttonsSize="small"
        buttons={actionButtons}
        inlineLayoutWhen="md and up"
      />
    </>
  )
}

export default withTrpc(ActeurIdentity)
