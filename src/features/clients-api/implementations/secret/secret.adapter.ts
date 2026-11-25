import { generateRandomSecret } from '@/features/clients-api/implementations/secret/generate-random-secret.adapter'
import { hashSecret } from '@/features/clients-api/implementations/secret/hash-secret.adapter'

export const nouveauSecret = () => {
  const secret = generateRandomSecret()
  return { secret, secretHash: hashSecret(secret) }
}
