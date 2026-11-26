import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  type CoordinateurId,
  CoordinateurIntrouvable,
  type Courriel,
  type EnvoyerUneInvitation,
  type InvitationEnAttente,
  type LireLeCoordinateur,
  type NomAffiche,
  type UtilisateurId,
} from '../../../domain'
import type { AucuneInvitationAEnvoyer } from './errors'
import type { InvitationsEnvoyees } from './invitations-envoyees'
import { type Existant, planifier } from './planifier'

export type Inviteur =
  | { readonly type: 'Coordinateur'; readonly coordinateurId: CoordinateurId }
  | { readonly type: 'NonCoordinateur' }

export type EchecDInvitation =
  | ActionNonAutorisee
  | AucuneInvitationAEnvoyer
  | CoordinateurIntrouvable

export type LireLExistant<Cles> = (lecture: {
  readonly coordinateurId: CoordinateurId
  readonly candidats: readonly Courriel[]
}) => Promise<{ readonly existant: Existant; readonly cles: Cles }>

export type EnregistrerLesInvitations<Cles> = (enregistrement: {
  readonly invitations: readonly InvitationEnAttente[]
  readonly cles: Cles
  readonly coordinateurId: CoordinateurId
  readonly auteurId: UtilisateurId
}) => Promise<void>

const envoyerAvec =
  ({
    envoyerUneInvitation,
    de,
  }: {
    readonly envoyerUneInvitation: EnvoyerUneInvitation
    readonly de: NomAffiche
  }) =>
  async (invitation: InvitationEnAttente): Promise<Courriel | null> =>
    (await envoyerUneInvitation({ invitation, de })).success
      ? null
      : invitation.reference.email

export const inviterDesMembres =
  <Cles>({
    lireLeCoordinateur,
    lireLExistant,
    enregistrerLesInvitations,
    envoyerUneInvitation,
  }: {
    readonly lireLeCoordinateur: LireLeCoordinateur
    readonly lireLExistant: LireLExistant<Cles>
    readonly enregistrerLesInvitations: EnregistrerLesInvitations<Cles>
    readonly envoyerUneInvitation: EnvoyerUneInvitation
  }) =>
  async ({
    inviteur,
    candidats,
    auteurId,
    maintenant,
  }: {
    readonly inviteur: Inviteur
    readonly candidats: readonly Courriel[]
    readonly auteurId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<InvitationsEnvoyees, EchecDInvitation>> => {
    if (inviteur.type === 'NonCoordinateur')
      return failure(ActionNonAutorisee())

    const { coordinateurId } = inviteur

    const coordinateur = await lireLeCoordinateur(coordinateurId)
    if (coordinateur === null) return failure(CoordinateurIntrouvable())

    const { existant, cles } = await lireLExistant({
      coordinateurId,
      candidats,
    })

    const planification = planifier({
      coordinateurId,
      candidats,
      existant,
      maintenant,
    })
    if (!planification.success) return planification

    const { aEnvoyer, ecartes } = planification.data

    await enregistrerLesInvitations({
      invitations: aEnvoyer,
      cles,
      coordinateurId,
      auteurId,
    })

    const echecs = (
      await Promise.all(
        aEnvoyer.map(
          envoyerAvec({ envoyerUneInvitation, de: coordinateur.nom }),
        ),
      )
    ).filter((email): email is Courriel => email !== null)

    return success({
      envoyees: aEnvoyer
        .map(({ reference }) => reference.email)
        .filter((email) => !echecs.includes(email)),
      ecartees: ecartes,
      echecs,
    })
  }
