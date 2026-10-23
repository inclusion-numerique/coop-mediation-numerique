'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import BackButton from '@app/web/components/BackButton'
import { INVITER_DES_MEMBRES_ACTION_KEY } from '@app/web/features/equipe/abilities/inviter-des-membres/action/inviter-des-membres.key'
import { RETIRER_UN_MEMBRE_ACTION_KEY } from '@app/web/features/equipe/abilities/retirer-un-membre/action/retirer-un-membre.key'
import { inject } from '@app/web/libs/injection/client'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import type { ButtonProps } from '@codegouvfr/react-dsfr/Button'
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useRouter } from 'next/navigation'
import { type ReactNode, useState } from 'react'
import type { Acteur } from '../../../../domain'
import { ProfilEtContact } from '../../../../ui/ProfilEtContact'
import type { ActionsDEquipe, StatutAffiche } from '../fiche-acteur.presenter'
import { BadgeDeStatut } from './BadgeDeStatut'

const modaleDeRetrait = createModal({
  id: 'remove-from-team-modal',
  isOpenedByDefault: false,
})

const modaleDInvitation = createModal({
  id: 'invite-to-team-modal',
  isOpenedByDefault: false,
})

export const IdentiteDeLActeur = ({
  acteur,
  profilCreeLe,
  statut,
  actions,
  coordinateurId,
  retourHref,
  suppressionDesArchives,
}: {
  acteur: Acteur
  profilCreeLe: Date
  statut: StatutAffiche
  actions: ActionsDEquipe
  coordinateurId: string | null
  retourHref: string
  suppressionDesArchives?: ReactNode
}) => {
  const router = useRouter()
  const [retrait, demarrerLeRetrait] = useState(false)
  const [invitation, demarrerLInvitation] = useState(false)
  const { nomAffiche, courriel } = acteur
  const mediateurId = acteur.profil.mediation?.mediateurId ?? null

  const retirer = async () => {
    if (mediateurId === null || coordinateurId === null) return
    demarrerLeRetrait(true)
    const resultat = await inject(RETIRER_UN_MEMBRE_ACTION_KEY)({
      mediateurId,
      coordinateurId,
    })
    if (!resultat.success) {
      demarrerLeRetrait(false)
      createToast({
        priority: 'error',
        message: `Une erreur est survenue lors de la suppression de ${nomAffiche} de votre équipe : ${resultat.error}`,
      })
      return
    }
    router.refresh()
    createToast({
      priority: 'success',
      message: `${nomAffiche} a bien été retiré de votre équipe`,
    })
  }

  const inviter = async () => {
    demarrerLInvitation(true)
    const resultat = await inject(INVITER_DES_MEMBRES_ACTION_KEY)({
      emails: [courriel],
    })
    modaleDInvitation.close()
    if (!resultat.success) {
      demarrerLInvitation(false)
      createToast({
        priority: 'error',
        message: `Une erreur est survenue lors de l'invitation de ${nomAffiche} à votre équipe : ${resultat.error}`,
      })
      return
    }
    createToast({
      priority: 'success',
      message: `${nomAffiche} a bien été invité à votre équipe`,
    })
    router.refresh()
  }

  const boutonDInvitationEnvoyee: ButtonProps[] =
    actions.invitationEnvoyeeLe === null
      ? []
      : [
          {
            type: 'button',
            disabled: true,
            children: (
              <span className="fr-flex fr-flex-gap-2v">
                <span className="ri-user-add-line" aria-hidden />
                Invitation envoyée le {dateAsDay(actions.invitationEnvoyeeLe)}
              </span>
            ),
            priority: 'tertiary',
            className: 'fr-mb-0',
          },
        ]

  const boutonDInvitation: ButtonProps[] = actions.inviter
    ? [
        {
          type: 'button',
          children: (
            <span className="fr-flex fr-flex-gap-2v">
              <span className="ri-user-add-line" aria-hidden />
              Inviter dans mon équipe
            </span>
          ),
          priority: 'primary',
          ...modaleDInvitation.buttonProps,
          ...buttonLoadingClassname(invitation, 'fr-mb-0'),
        },
      ]
    : []

  const boutonDeRetrait: ButtonProps[] = actions.retirer
    ? [
        {
          type: 'button',
          children: (
            <span className="fr-flex fr-flex-gap-2v fr-text-default--error">
              <span className="ri-user-unfollow-line" aria-hidden />
              Retirer de mon équipe
            </span>
          ),
          priority: 'tertiary',
          ...modaleDeRetrait.buttonProps,
          ...buttonLoadingClassname(retrait, 'fr-mb-0'),
        },
      ]
    : []

  const boutonDeContact: ButtonProps = {
    className: 'fr-mb-0',
    children: (
      <span className="fr-flex fr-flex-gap-2v">
        <span className="ri-mail-line" aria-hidden />
        Contacter par email
      </span>
    ),
    title: 'Contacter par email - client mail',
    linkProps: { href: `mailto:${courriel}` },
    priority: 'tertiary',
  }

  const boutons: [ButtonProps, ...ButtonProps[]] = [
    ...boutonDInvitationEnvoyee,
    ...boutonDInvitation,
    ...boutonDeRetrait,
  ].reduceRight<[ButtonProps, ...ButtonProps[]]>(
    (suivants, bouton) => [bouton, ...suivants],
    [boutonDeContact],
  )

  return (
    <>
      <modaleDeRetrait.Component
        title={`Retirer ‘${nomAffiche}’ de mon équipe`}
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: modaleDeRetrait.close,
          },
          { children: 'Retirer de mon équipe', onClick: retirer },
        ]}
      >
        Êtes-vous sûr de vouloir retirer ce médiateur numérique de votre
        équipe&nbsp;?
        <Notice
          className="fr-notice--flex fr-mt-4v"
          title={
            <span className="fr-text--left fr-text-default--grey fr-text--regular">
              Vous n’aurez plus accès aux prochaines activités et statistiques
              enregistrés{' '}
              <b>
                à partir du moment où vous aurez retiré ‘{nomAffiche}’ de votre
                équipe.
              </b>
              <br />
              <br />
              Vous conserverez uniquement l’accès à ses activités et
              statistiques archivés <b>jusqu’à ce jour.</b>
            </span>
          }
        />
      </modaleDeRetrait.Component>
      <modaleDInvitation.Component
        title={`Inviter "${nomAffiche}" à rejoindre votre équipe de coordination.`}
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: modaleDInvitation.close,
          },
          {
            children: "Envoyer l'invitation",
            onClick: inviter,
            ...buttonLoadingClassname(invitation),
          },
        ]}
      >
        <strong>{nomAffiche}</strong> va recevoir une invitation par mail.
      </modaleDInvitation.Component>
      <BackButton href={retourHref} />
      <div className="fr-flex fr-direction-column">
        <div className="fr-flex fr-align-items-center fr-mb-3v">
          <p className="fr-mb-0 fr-text-mention--grey fr-text--sm">
            Profil créé le {dateAsDay(profilCreeLe)}&nbsp;&nbsp;·&nbsp;&nbsp;
          </p>
          <BadgeDeStatut statut={statut} />
        </div>
        <h1 className="fr-h2 fr-page-title fr-mb-3v">{nomAffiche}</h1>
        <ProfilEtContact acteur={acteur} className="fr-mb-4v" />
      </div>
      <div className="fr-flex fr-align-items-center fr-flex-gap-2v fr-mt-2v fr-mb-12v">
        <ButtonsGroup
          className="fr-mb-0"
          buttonsSize="small"
          buttons={boutons}
          inlineLayoutWhen="md and up"
        />
        {suppressionDesArchives}
      </div>
    </>
  )
}
