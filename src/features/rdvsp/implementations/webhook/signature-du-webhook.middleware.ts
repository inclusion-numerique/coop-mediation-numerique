import crypto from 'node:crypto'

export const ENTETE_SIGNATURE_WEBHOOK = 'x-lapin-signature'

export const signatureValide = ({
  corpsBrut,
  signature,
  secret,
}: {
  corpsBrut: string
  signature: string | null
  secret: string
}): boolean => {
  if (signature === null || secret === '') {
    return false
  }

  const attendue = crypto
    .createHmac('sha256', secret)
    .update(corpsBrut, 'utf8')
    .digest('hex')

  const recue = Buffer.from(signature, 'utf8')
  const calculee = Buffer.from(attendue, 'utf8')

  return (
    recue.length === calculee.length && crypto.timingSafeEqual(recue, calculee)
  )
}
