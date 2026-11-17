import { createTransport } from 'nodemailer'
import { ServerWebAppConfig } from '@/ServerWebAppConfig'

export const emailTransport = createTransport(ServerWebAppConfig.Email.server)
