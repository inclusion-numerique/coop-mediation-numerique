import pThrottle from 'p-throttle'
import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'
import { ServerWebAppConfig } from '@/configuration/projet/ServerWebAppConfig'

export const brevoApiThrottle = pThrottle({
  limit: 10,
  interval: 1100,
})

export const deploymentCanCreateBrevoContact = () =>
  PublicWebAppConfig.isMain && !ServerWebAppConfig.isE2e
