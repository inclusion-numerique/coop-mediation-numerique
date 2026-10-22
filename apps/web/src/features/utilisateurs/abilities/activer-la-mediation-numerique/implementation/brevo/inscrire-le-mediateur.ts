import {
  createBrevoContact,
  deploymentCanCreateBrevoContact,
  toBrevoContact,
} from '@app/web/external-apis/brevo/createBrevoContact'
import { personneEstConseillerNumerique } from '@app/web/features/employeuse/server'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import type { CompteLu } from '../prisma/activer.mutation'

export const inscrireLeMediateur = async (
  compte: CompteLu,
  mediateurId: string,
): Promise<void> => {
  if (compte.inscriptionValidee === null || !deploymentCanCreateBrevoContact())
    return

  await createBrevoContact({
    contact: toBrevoContact({
      id: compte.id,
      email: compte.email,
      firstName: compte.firstName,
      lastName: compte.lastName,
      phone: compte.phone,
      mediateur: { id: mediateurId },
      coordinateur: compte.coordinateur,
      isConseillerNumerique: personneEstConseillerNumerique(
        compte.personneMain,
      ),
    }),
    listIds: [ServerWebAppConfig.Brevo.usersListId],
  })
}
