import { signaler } from '@app/web/configuration/telemetry/error-reporter/server/signaler'
import { removeBrevoUserContact } from '@app/web/external-apis/brevo/removeBrevoUserContact'
import type { AdresseCourriel } from '@app/web/features/utilisateurs/domain'

export const retirerLaSourceDesListes = async (
  courriel: AdresseCourriel,
): Promise<void> => {
  await removeBrevoUserContact(courriel).catch((erreur: unknown) => {
    signaler(erreur)
  })
}
