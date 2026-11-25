import { environnementClient } from '@/configuration/environnement'

export const rdvspOAuthHostname =
  environnementClient.NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_HOSTNAME

export const rdvspOAuthClientId =
  environnementClient.NEXT_PUBLIC_RDV_SERVICE_PUBLIC_OAUTH_CLIENT_ID
