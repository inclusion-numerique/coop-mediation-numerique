import { PublicWebAppConfig } from '@/PublicWebAppConfig'

/**
 * Depending on the environment we have a different provider configuration
 */
export const authenticationViaProconnect =
  PublicWebAppConfig.isLocal ||
  PublicWebAppConfig.isE2e ||
  PublicWebAppConfig.isMain ||
  PublicWebAppConfig.isDev

export const authenticationViaEmailMagicLink = !authenticationViaProconnect
