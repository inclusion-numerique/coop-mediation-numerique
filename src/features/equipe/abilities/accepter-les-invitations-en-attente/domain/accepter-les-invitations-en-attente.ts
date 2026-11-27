import { failure, type Result, success } from '@/libraries/result'
import type { UtilisateurId } from '../../../domain'
import {
  type AcceptationsEnAttente,
  acceptationsEnAttente,
} from './acceptations-en-attente'
import {
  CourrielDuMediateurIllisible,
  type EchecDeAccepterLesInvitationsEnAttente,
} from './errors'
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
  }): Promise<
    Result<AcceptationsEnAttente, EchecDeAccepterLesInvitationsEnAttente>
  > => {
    const lu = await lireLeMediateurInvite(utilisateurId)
    if (lu === null) return success({ type: 'SansCompteMediateur' })

    const { mediateurId, email } = lu
    if (email === null)
      return failure(CourrielDuMediateurIllisible(mediateurId))

    const mediateur = { mediateurId, email }

    const acceptations = acceptationsEnAttente({
      mediateur,
      invitations: await lireLesInvitationsDe(mediateur.email),
      maintenant,
    })

    await enregistrerLesAcceptations(acceptations)

    return success(acceptations)
  }
