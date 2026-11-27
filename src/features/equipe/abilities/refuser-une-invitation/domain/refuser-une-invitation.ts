import { failure, type Result, success } from '@/libraries/result'
import {
  exigerEnAttente,
  InvitationIntrouvable,
  prevenanceDe,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../domain'
import type { EchecDeRefuserUneInvitation } from './errors'
import type { RefuserUneInvitationPorts } from './ports'
import type { Refus, RefusEnregistre } from './refus'

export const refuserUneInvitation =
  <Cle>({
    lireUneInvitation,
    enregistrerLeRefus,
    lireLeCoordinateur,
    prevenirLeCoordinateur,
  }: RefuserUneInvitationPorts<Cle>) =>
  async ({
    reference,
    auteurId,
    maintenant,
  }: {
    readonly reference: ReferenceInvitation
    readonly auteurId: UtilisateurId | null
    readonly maintenant: Date
  }): Promise<Result<RefusEnregistre, EchecDeRefuserUneInvitation>> => {
    const lue = await lireUneInvitation(reference)
    if (lue === null) return failure(InvitationIntrouvable())

    const enAttente = exigerEnAttente(lue.invitation)
    if (!enAttente.success) return enAttente

    const refus: Refus = { reference, auteurId, refuseeLe: maintenant }

    await enregistrerLeRefus({ cle: lue.cle, ...refus })

    const prevenance = prevenanceDe({
      coordinateur: await lireLeCoordinateur(reference.coordinateurId),
      reference,
      reponse: 'Refusee',
    })
    if (prevenance !== null) await prevenirLeCoordinateur(prevenance)

    return success({ refus, prevenance })
  }
