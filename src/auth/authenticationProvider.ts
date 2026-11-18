import { PublicWebAppConfig } from '@/PublicWebAppConfig'
import { ServerWebAppConfig } from '@/ServerWebAppConfig'

/**
 * Depending on the environment we have a different provider configuration
 */
export const authenticationViaProconnect =
  PublicWebAppConfig.isLocal ||
  ServerWebAppConfig.isE2e ||
  PublicWebAppConfig.isMain ||
  PublicWebAppConfig.isDev

export const authenticationViaEmailMagicLink = !authenticationViaProconnect
