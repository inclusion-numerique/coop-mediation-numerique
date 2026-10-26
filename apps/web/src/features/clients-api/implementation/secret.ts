import { generateRandomSecret } from '@app/web/security/generateRandomSecret'
import { hashSecret } from '@app/web/security/hashSecret'

export const nouveauSecret = () => {
  const secret = generateRandomSecret()
  return { secret, secretHash: hashSecret(secret) }
}
