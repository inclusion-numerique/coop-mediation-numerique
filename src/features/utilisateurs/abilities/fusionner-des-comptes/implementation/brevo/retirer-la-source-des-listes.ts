import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { removeBrevoUserContact } from '@/external-apis/brevo/removeBrevoUserContact'
import type { AdresseCourriel } from '@/features/utilisateurs/domain'

export const retirerLaSourceDesListes = async (
  courriel: AdresseCourriel,
): Promise<void> => {
  await removeBrevoUserContact(courriel).catch((erreur: unknown) => {
    signaler(erreur)
  })
}
