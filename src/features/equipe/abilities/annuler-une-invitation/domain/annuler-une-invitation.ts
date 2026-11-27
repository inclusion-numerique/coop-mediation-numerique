import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  exigerEnAttente,
  type Gestionnaire,
  InvitationIntrouvable,
  peutGererLEquipe,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../domain'
import type { Annulation } from './annulation'
import type { EchecDeAnnulerUneInvitation } from './errors'
import type { AnnulerUneInvitationPorts } from './ports'

export const annulerUneInvitation =
  <Cle>({
    lireUneInvitation,
    supprimerLInvitation,
  }: AnnulerUneInvitationPorts<Cle>) =>
  async ({
    reference,
    gestionnaire,
    auteurId,
  }: {
    readonly reference: ReferenceInvitation
    readonly gestionnaire: Gestionnaire
    readonly auteurId: UtilisateurId
  }): Promise<Result<Annulation, EchecDeAnnulerUneInvitation>> => {
    if (!peutGererLEquipe(gestionnaire)(reference.coordinateurId))
      return failure(ActionNonAutorisee())

    const lue = await lireUneInvitation(reference)
    if (lue === null) return failure(InvitationIntrouvable())

    const enAttente = exigerEnAttente(lue.invitation)
    if (!enAttente.success) return enAttente

    const annulation: Annulation = { reference, auteurId }

    await supprimerLInvitation({ cle: lue.cle, ...annulation })

    return success(annulation)
  }
