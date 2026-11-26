import { failure, type Result, success } from '@/libraries/result'
import {
  exigerEnAttente,
  type InvitationDejaTraitee,
  InvitationIntrouvable,
  type LireLeCoordinateur,
  type LireUneInvitation,
  type PrevenirLeCoordinateur,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../domain'

export type EchecDeRefus = InvitationIntrouvable | InvitationDejaTraitee

export type EnregistrerLeRefus<Cle> = (refus: {
  readonly cle: Cle
  readonly reference: ReferenceInvitation
  readonly auteurId: UtilisateurId | null
  readonly maintenant: Date
}) => Promise<void>

export const refuserUneInvitation =
  <Cle>({
    lireUneInvitation,
    enregistrerLeRefus,
    lireLeCoordinateur,
    prevenirLeCoordinateur,
  }: {
    readonly lireUneInvitation: LireUneInvitation<Cle>
    readonly enregistrerLeRefus: EnregistrerLeRefus<Cle>
    readonly lireLeCoordinateur: LireLeCoordinateur
    readonly prevenirLeCoordinateur: PrevenirLeCoordinateur
  }) =>
  async ({
    reference,
    auteurId,
    maintenant,
  }: {
    readonly reference: ReferenceInvitation
    readonly auteurId: UtilisateurId | null
    readonly maintenant: Date
  }): Promise<Result<void, EchecDeRefus>> => {
    const lue = await lireUneInvitation(reference)
    if (lue === null) return failure(InvitationIntrouvable())

    const enAttente = exigerEnAttente(lue.invitation)
    if (!enAttente.success) return enAttente

    await enregistrerLeRefus({ cle: lue.cle, reference, auteurId, maintenant })

    const coordinateur = await lireLeCoordinateur(reference.coordinateurId)
    if (coordinateur !== null)
      await prevenirLeCoordinateur({
        coordinateur: coordinateur.email,
        invite: reference.email,
        reponse: 'Refusee',
      })

    return success(undefined)
  }
