import { type Result, success } from '@/libraries/result'
import type { Courriel, ReferenceInvitation } from '../../../domain'
import type { ConsulterUneInvitationPorts } from './ports'
import { type VueInvitation, vueInvitation } from './vue-invitation'

export const consulterUneInvitation =
  <Cle>({
    lireUneInvitation,
    lireLeCoordinateur,
    compterLesMembresActifs,
  }: ConsulterUneInvitationPorts<Cle>) =>
  async ({
    reference,
    session,
  }: {
    readonly reference: ReferenceInvitation | null
    readonly session: Courriel | null
  }): Promise<Result<VueInvitation, never>> => {
    if (reference === null) return success({ type: 'Illisible' })

    const [lue, coordinateur, tailleEquipe] = await Promise.all([
      lireUneInvitation(reference),
      lireLeCoordinateur(reference.coordinateurId),
      compterLesMembresActifs(reference.coordinateurId),
    ])

    return success(
      vueInvitation({
        invitation: lue?.invitation ?? null,
        session,
        coordinateur,
        tailleEquipe,
      }),
    )
  }
