import { environnementClient } from '@/configuration/environnement/client'
import {
  chromaticAppId,
  mainLiveUrl,
  projectTitle,
  repositoryUrl,
} from '@/configuration/projet/config'

const branche = environnementClient.NEXT_PUBLIC_BRANCH
const isMain = branche === 'main'
const isDev = branche === 'dev'
const isLocal = !branche

export const PublicWebAppConfig = {
  centreAideUrl:
    'https://docs.numerique.gouv.fr/docs/1cf724be-c40c-4299-906d-df22c181c77b/',
  Branch: branche ?? '',
  isMain,
  isDev,
  isLocal,
  isPreview: !isMain && !isDev && !isLocal,
  contactEmail: environnementClient.NEXT_PUBLIC_CONTACT_EMAIL,
  projectTitle,
  mainLiveUrl,
  repository: repositoryUrl,
  Chromatic: {
    appId: chromaticAppId,
  },
  ProConnect: {
    hostname: environnementClient.NEXT_PUBLIC_PROCONNECT_HOSTNAME,
    clientId: environnementClient.NEXT_PUBLIC_PROCONNECT_CLIENT_ID,
  },
  RdvServicePublic: {
    OAuth: {
      hostname:
        environnementClient.NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_HOSTNAME,
      clientId:
        environnementClient.NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_CLIENT_ID,
    },
  },
  Sentry: {
    dsn: environnementClient.NEXT_PUBLIC_SENTRY_DSN ?? '',
    environment: environnementClient.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  },
  Matomo: {
    host: environnementClient.NEXT_PUBLIC_MATOMO_HOST ?? '',
    siteId: environnementClient.NEXT_PUBLIC_MATOMO_SITE_ID ?? '',
  },
}
