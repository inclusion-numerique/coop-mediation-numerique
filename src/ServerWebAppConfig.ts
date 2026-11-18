import { environnementServeur } from '@/configuration/environnement/serveur'

const {
  SMTP_USERNAME,
  SMTP_PASSWORD,
  SMTP_SERVER,
  SMTP_PORT,
  EMAIL_FROM_NAME,
  EMAIL_FROM_ADDRESS,
} = environnementServeur

export const ServerWebAppConfig = {
  isE2e: environnementServeur.IS_E2E,
  Email: {
    server: `smtp://${SMTP_USERNAME}:${SMTP_PASSWORD}@${SMTP_SERVER}:${SMTP_PORT}`,
    from: `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`,
  },
  ProConnect: {
    clientSecret: environnementServeur.PROCONNECT_CLIENT_SECRET,
  },
  Brevo: {
    apiKey: environnementServeur.BREVO_API_KEY,
    usersListId: environnementServeur.BREVO_USERS_LIST_ID,
  },
  Sudo: {
    usurpation: environnementServeur.SUDO_USURPATION,
  },
  RdvServicePublic: {
    webhookSecret: environnementServeur.RDV_SERVICE_PUBLIC_WEBHOOK_SECRET,
    OAuth: {
      clientSecret: environnementServeur.RDV_SERVICE_PUBLIC_OAUTH_CLIENT_SECRET,
    },
    log: {
      webhook: {
        debug: environnementServeur.RDV_SERVICE_PUBLIC_WEBHOOK_DEBUG,
      },
    },
  },
  Security: {
    hmacSecretKey: environnementServeur.HMAC_SECRET_KEY,
  },
}
