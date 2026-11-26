import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  CoordinateurIntrouvable,
  type Courriel,
  type InvitationEnAttente,
  type NomAffiche,
  type UtilisateurId,
} from '../../../domain'
import type { EchecDInvitation } from './errors'
import type {
  EnregistrementDesInvitations,
  InvitationsDecidees,
} from './invitations-envoyees'
import type { Inviteur } from './inviteur'
import { planifier } from './planifier'
import type { EnvoiDesInvitationsPorts, InviterDesMembresPorts } from './ports'

const envoyerAvec =
  ({ envoyerUneInvitation }: EnvoiDesInvitationsPorts) =>
  (de: NomAffiche) =>
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
  }: InviterDesMembresPorts<Cles>) =>
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
  }): Promise<Result<InvitationsDecidees, EchecDInvitation>> => {
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

    const enregistrement: EnregistrementDesInvitations = {
      invitations: aEnvoyer,
      coordinateurId,
      auteurId,
    }

    await enregistrerLesInvitations({ ...enregistrement, cles })

    const de = coordinateur.nom

    const echecs = (
      await Promise.all(aEnvoyer.map(envoyerAvec({ envoyerUneInvitation })(de)))
    ).filter((email): email is Courriel => email !== null)

    return success({
      enregistrement,
      de,
      envoyees: aEnvoyer
        .map(({ reference }) => reference.email)
        .filter((email) => !echecs.includes(email)),
      ecartees: ecartes,
      echecs,
    })
  }
