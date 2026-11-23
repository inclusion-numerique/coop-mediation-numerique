import { generateRandomSecret } from '@/features/clients-api/implementation/generateRandomSecret'
import { hashSecret } from '@/features/clients-api/implementation/hashSecret'

export const nouveauSecret = () => {
  const secret = generateRandomSecret()
  return { secret, secretHash: hashSecret(secret) }
}
