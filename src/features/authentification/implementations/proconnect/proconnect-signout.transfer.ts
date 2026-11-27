import { getServerUrl } from '@/configuration/projet/serveur'
import { proConnectHostname } from './proconnect.client'

const proconnectSignoutRedirectPath = '/deconnexion/callback'

export type ProconnectSignoutState = {
  callbackUrl: string
  nonce: string
}

export const generateProconnectSignoutUrl = ({
  callbackUrl: _callbackUrl,
  idTokenHint,
}: {
  idTokenHint: string
  callbackUrl: string
}) => {
  const postLogoutRedirectUri = getServerUrl(proconnectSignoutRedirectPath, {
    absolutePath: true,
  })
  const queryParams = new URLSearchParams({
    post_logout_redirect_uri: postLogoutRedirectUri,
    id_token_hint: idTokenHint,
  })

  return `https://${proConnectHostname}/api/v2/session/end?${queryParams.toString()}`
}
