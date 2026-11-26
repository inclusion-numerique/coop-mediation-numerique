import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  exigerEnAttente,
  type Gestionnaire,
  type InvitationDejaTraitee,
  InvitationIntrouvable,
  type LireUneInvitation,
  peutGererLEquipe,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../domain'

export type EchecDAnnulation =
  | ActionNonAutorisee
  | InvitationIntrouvable
  | InvitationDejaTraitee

export type SupprimerLInvitation<Cle> = (suppression: {
  readonly cle: Cle
  readonly reference: ReferenceInvitation
  readonly auteurId: UtilisateurId
}) => Promise<void>

export const annulerUneInvitation =
  <Cle>({
    lireUneInvitation,
    supprimerLInvitation,
  }: {
    readonly lireUneInvitation: LireUneInvitation<Cle>
    readonly supprimerLInvitation: SupprimerLInvitation<Cle>
  }) =>
  async ({
    reference,
    gestionnaire,
    auteurId,
  }: {
    readonly reference: ReferenceInvitation
    readonly gestionnaire: Gestionnaire
    readonly auteurId: UtilisateurId
  }): Promise<Result<void, EchecDAnnulation>> => {
    if (!peutGererLEquipe(gestionnaire)(reference.coordinateurId))
      return failure(ActionNonAutorisee())

    const lue = await lireUneInvitation(reference)
    if (lue === null) return failure(InvitationIntrouvable())

    const enAttente = exigerEnAttente(lue.invitation)
    if (!enAttente.success) return enAttente

    await supprimerLInvitation({ cle: lue.cle, reference, auteurId })

    return success(undefined)
  }
