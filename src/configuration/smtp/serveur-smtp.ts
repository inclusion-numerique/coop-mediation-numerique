import { environnementServeur } from '@/configuration/environnement/serveur'

const {
  SMTP_USERNAME,
  SMTP_PASSWORD,
  SMTP_SERVER,
  SMTP_PORT,
  EMAIL_FROM_NAME,
  EMAIL_FROM_ADDRESS,
} = environnementServeur()

export const serveurSmtp = `smtp://${SMTP_USERNAME}:${SMTP_PASSWORD}@${SMTP_SERVER}:${SMTP_PORT}`

export const expediteur = `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`
