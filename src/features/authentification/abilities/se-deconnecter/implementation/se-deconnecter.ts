import { refreshProconnectIdToken } from '@/features/authentification/implementation/proconnect/getProconnectIdToken'
import { jetonNonExpire } from '../domain'
import { jetonsProconnect } from './prisma'

const maintenantEnSecondes = (): number => Math.floor(Date.now() / 1000)

export const idTokenPourDeconnexion = async (
  utilisateurId: string,
): Promise<string | null> => {
  const { idToken, refreshToken } = await jetonsProconnect(utilisateurId)
  if (idToken && jetonNonExpire(idToken, maintenantEnSecondes())) return idToken
  return refreshToken ? refreshProconnectIdToken(refreshToken) : null
}
