import { failure, type Result, success } from '@/libraries/result'
import {
  adherer,
  InvitationIntrouvable,
  prevenanceDe,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../domain'
import type { Acceptation, AcceptationEnregistree } from './acceptation'
import { type Accepteur, mediateurQuiAccepte } from './accepter'
import type { EchecDAcceptation } from './errors'
import type { AccepterUneInvitationPorts } from './ports'

export const accepterUneInvitation =
  <Cle>({
    lireUneInvitation,
    lireLesAdhesionsDeLaPaire,
    enregistrerLAcceptation,
    lireLeCoordinateur,
    prevenirLeCoordinateur,
  }: AccepterUneInvitationPorts<Cle>) =>
  async ({
    reference,
    accepteur,
    auteurId,
    maintenant,
  }: {
    readonly reference: ReferenceInvitation
    readonly accepteur: Accepteur
    readonly auteurId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<AcceptationEnregistree, EchecDAcceptation>> => {
    const lue = await lireUneInvitation(reference)
    if (lue === null) return failure(InvitationIntrouvable())

    const mediateur = mediateurQuiAccepte(lue.invitation, accepteur)
    if (!mediateur.success) return mediateur

    const paire = {
      mediateurId: mediateur.data,
      coordinateurId: reference.coordinateurId,
    }
    const adhesion = adherer(paire, await lireLesAdhesionsDeLaPaire(paire))

    const acceptation: Acceptation = {
      reference,
      mediateurId: mediateur.data,
      auteurId,
      accepteeLe: maintenant,
      adhesion: adhesion.success ? adhesion.data : null,
    }

    await enregistrerLAcceptation({ cle: lue.cle, ...acceptation })

    const prevenance = prevenanceDe({
      coordinateur: await lireLeCoordinateur(reference.coordinateurId),
      reference,
      reponse: 'Acceptee',
    })
    if (prevenance !== null) await prevenirLeCoordinateur(prevenance)

    return success({ acceptation, prevenance })
  }
