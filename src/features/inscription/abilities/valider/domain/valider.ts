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
  <Contact>({
    lireFaitsInscription,
    enregistrerValidation,
    lireLeContactAInscrire,
    inscrireALaListeDeDiffusion,
    accepterLesInvitations,
    signaler,
  }: ValiderPorts<Contact>) =>
  async ({
    userId,
    maintenant,
  }: {
    readonly userId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<InscriptionValidee<Contact>, EchecDeValider>> => {
    const validation = validerInscription({
      faits: await lireFaitsInscription(userId),
      maintenant,
    })

    if (!validation.success) return validation

    await enregistrerValidation(validation.data)

    const contactInscrit = await lireLeContactAInscrire(userId)
    if (contactInscrit !== null)
      await inscrireALaListeDeDiffusion(contactInscrit)

    const acceptation = await accepterLesInvitations(userId)
    if (!acceptation.success) signaler(acceptation.error)

    return success({
      ...validation.data,
      contactInscrit,
      acceptationDesInvitations: acceptationDesInvitations(acceptation),
    })
  }
