import { generateRandomSecret } from '@/features/clients-api/implementations/generateRandomSecret'
import { hashSecret } from '@/features/clients-api/implementations/hashSecret'

export const nouveauSecret = () => {
  const secret = generateRandomSecret()
  return { secret, secretHash: hashSecret(secret) }
}
