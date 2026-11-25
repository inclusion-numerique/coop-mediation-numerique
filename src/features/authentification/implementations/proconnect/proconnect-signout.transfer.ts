import { getServerUrl } from '@/configuration/projet/serveur'
import { proConnectHostname } from './proconnect.client'

const proconnectSignoutRedirectPath = '/deconnexion/callback'

export type ProconnectSignoutState = {
  callbackUrl: string
  nonce: string
}

/**
 * After proconnect signout, we redirect to our callbackUrl with the state
 * This will only signout the user from proconnect, not from the app.
 * The proconnectSignoutRedirectPath callback will destroy the session and redirect to the callbackUrl
 */
export const generateProconnectSignoutUrl = ({
  callbackUrl: _callbackUrl,
  idTokenHint,
}: {
  idTokenHint: string
  callbackUrl: string
}) => {
  // ProConnect does not support dynamic state parameter so we remove state from the url
  // https://github.com/numerique-gouv/proconnect-documentation/blob/main/doc_fs/implementation_technique.md#243-vérification-du-state
  // const state = encodeSerializableState({
  //   callbackUrl,
  //   nonce: v4(),
  // })

  const postLogoutRedirectUri = getServerUrl(proconnectSignoutRedirectPath, {
    absolutePath: true,
  })
  const queryParams = new URLSearchParams({
    post_logout_redirect_uri: postLogoutRedirectUri,
    id_token_hint: idTokenHint,
  })

  return `https://${proConnectHostname}/api/v2/session/end?${queryParams.toString()}`
}
