import { refreshProconnectIdToken } from '@/features/authentification/implementations/proconnect/proconnect-id-token.query'
import { type JetonsProconnect, jetonNonExpire } from '../../domain'

const maintenantEnSecondes = (): number => Math.floor(Date.now() / 1000)

export const idTokenPourDeconnexion = async ({
  idToken,
  refreshToken,
}: JetonsProconnect): Promise<string | null> => {
  if (idToken && jetonNonExpire(idToken, maintenantEnSecondes())) return idToken
  return refreshToken ? refreshProconnectIdToken(refreshToken) : null
}
