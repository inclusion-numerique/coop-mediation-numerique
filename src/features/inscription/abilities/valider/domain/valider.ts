import type { UtilisateurId } from '@/features/inscription/domain'
import { type Result, success } from '@/libraries/result'
import type { EchecDeValider } from './errors'
import type { ValiderPorts } from './ports'
import {
  acceptationDesInvitations,
  type InscriptionValidee,
  validerInscription,
} from './valider-inscription'

export const valider =
  <Inscription>({
    lireFaitsInscription,
    enregistrerValidation,
    inscrireALaListeDeDiffusion,
    accepterLesInvitations,
    signaler,
  }: ValiderPorts<Inscription>) =>
  async ({
    userId,
    maintenant,
  }: {
    readonly userId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<InscriptionValidee<Inscription>, EchecDeValider>> => {
    const validation = validerInscription({
      faits: await lireFaitsInscription(userId),
      maintenant,
    })

    if (!validation.success) return validation

    await enregistrerValidation(validation.data)

    const { data: inscriptionALaListe } = await inscrireALaListeDeDiffusion({
      utilisateurId: userId,
    })

    const acceptation = await accepterLesInvitations({ userId, maintenant })
    if (!acceptation.success) signaler(acceptation.error)

    return success({
      ...validation.data,
      inscriptionALaListe,
      acceptationDesInvitations: acceptationDesInvitations(acceptation),
    })
  }
