import { createTransport } from 'nodemailer'
import { ServerWebAppConfig } from '@/configuration/projet/ServerWebAppConfig'

export const emailTransport = createTransport(ServerWebAppConfig.Email.server)
