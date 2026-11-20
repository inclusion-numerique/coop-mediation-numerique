import { createTransport } from 'nodemailer'
import { serveurSmtp } from './serveur'

export const emailTransport = createTransport(serveurSmtp)
