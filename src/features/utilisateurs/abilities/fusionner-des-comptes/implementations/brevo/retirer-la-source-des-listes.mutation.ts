import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import type { AdresseCourriel } from '@/features/utilisateurs/domain'
import { removeBrevoUserContact } from '@/features/utilisateurs/implementations/brevo/remove-brevo-user-contact.mutation'

export const retirerLaSourceDesListes = async (
  courriel: AdresseCourriel,
): Promise<void> => {
  await removeBrevoUserContact(courriel).catch((erreur: unknown) => {
    signaler(erreur)
  })
}
