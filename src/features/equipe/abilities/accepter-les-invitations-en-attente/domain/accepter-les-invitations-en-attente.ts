import { type Result, success } from '@/libraries/result'
import type { UtilisateurId } from '../../../domain'
import {
  type AcceptationsEnAttente,
  acceptationsEnAttente,
} from './acceptations-en-attente'
import type { AccepterLesInvitationsEnAttentePorts } from './ports'

export const accepterLesInvitationsEnAttente =
  ({
    lireLeMediateurInvite,
    lireLesInvitationsDe,
    enregistrerLesAcceptations,
  }: AccepterLesInvitationsEnAttentePorts) =>
  async ({
    utilisateurId,
    maintenant,
  }: {
    readonly utilisateurId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<AcceptationsEnAttente, never>> => {
    const mediateur = await lireLeMediateurInvite(utilisateurId)
    if (mediateur === null) return success({ type: 'SansCompteMediateur' })

    const acceptations = acceptationsEnAttente({
      mediateur,
      invitations: await lireLesInvitationsDe(mediateur.email),
      maintenant,
    })

    await enregistrerLesAcceptations(acceptations)

    return success(acceptations)
  }
