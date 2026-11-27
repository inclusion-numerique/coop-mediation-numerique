import crypto from 'node:crypto'
import { environnementServeur } from '@/configuration/environnement/serveur'

export const hashSecret = (secret: string): string => {
  if (!environnementServeur().HMAC_SECRET_KEY) {
    throw new Error('HMAC_SECRET_KEY is not set')
  }

  return crypto
    .createHmac('sha256', environnementServeur().HMAC_SECRET_KEY)
    .update(secret)
    .digest('hex')
}

export const verifySecret = (secret: string, hashedSecret: string): boolean => {
  const hashToCompare = hashSecret(secret)
  return crypto.timingSafeEqual(
    Buffer.from(hashToCompare, 'hex'),
    Buffer.from(hashedSecret, 'hex'),
  )
}
