import { generateRandomSecret } from '@/security/generateRandomSecret'
import { hashSecret } from '@/security/hashSecret'

export const nouveauSecret = () => {
  const secret = generateRandomSecret()
  return { secret, secretHash: hashSecret(secret) }
}
