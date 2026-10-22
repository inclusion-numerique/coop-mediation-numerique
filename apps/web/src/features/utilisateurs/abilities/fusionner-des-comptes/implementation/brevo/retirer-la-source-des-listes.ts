import { removeBrevoUserContact } from '@app/web/external-apis/brevo/removeBrevoUserContact'
import type { AdresseCourriel } from '@app/web/features/utilisateurs/domain'
import * as Sentry from '@sentry/nextjs'

export const retirerLaSourceDesListes = async (
  courriel: AdresseCourriel,
): Promise<void> => {
  await removeBrevoUserContact(courriel).catch((erreur: unknown) => {
    Sentry.captureException?.(erreur)
  })
}
