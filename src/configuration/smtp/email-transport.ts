import { createTransport } from 'nodemailer'
import { serveurSmtp } from './serveur-smtp'

export const emailTransport = createTransport(serveurSmtp)
