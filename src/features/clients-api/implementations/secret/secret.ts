import { generateRandomSecret } from '@/features/clients-api/implementations/secret/generate-random-secret'
import { hashSecret } from '@/features/clients-api/implementations/secret/hash-secret'

export const nouveauSecret = () => {
  const secret = generateRandomSecret()
  return { secret, secretHash: hashSecret(secret) }
}
