import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import type { AdresseCourriel } from '@/features/utilisateurs/domain'
import { removeBrevoUserContact } from '@/features/utilisateurs/implementations/brevo/removeBrevoUserContact'

export const retirerLaSourceDesListes = async (
  courriel: AdresseCourriel,
): Promise<void> => {
  await removeBrevoUserContact(courriel).catch((erreur: unknown) => {
    signaler(erreur)
  })
}
