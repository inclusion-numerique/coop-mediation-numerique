import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'
import { ServerWebAppConfig } from '@/configuration/projet/ServerWebAppConfig'

export const brevoActif = () =>
  PublicWebAppConfig.isMain && !ServerWebAppConfig.isE2e
