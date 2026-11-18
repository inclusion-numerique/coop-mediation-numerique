import axios from 'axios'
import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'

const issuer = `https://${PublicWebAppConfig.ProConnect.hostname}`

export async function refreshProconnectIdToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: PublicWebAppConfig.ProConnect.clientId,
      refresh_token: refreshToken,
    }).toString()

    const response = await axios<{ id_token: string }>({
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data,
      url: `${issuer}/api/v2/token`,
    })

    const idToken = response.data?.id_token
    return typeof idToken === 'string' && idToken.length > 0 ? idToken : null
  } catch {
    return null
  }
}
