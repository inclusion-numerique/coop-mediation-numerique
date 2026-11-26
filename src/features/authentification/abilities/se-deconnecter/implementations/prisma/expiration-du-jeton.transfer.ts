const expirationEnSecondes = (chargeUtile: unknown): number | null =>
  typeof chargeUtile === 'object' &&
  chargeUtile !== null &&
  'exp' in chargeUtile &&
  typeof chargeUtile.exp === 'number'
    ? chargeUtile.exp
    : null

const chargeUtileDe = (jeton: string): unknown => {
  const [, chargeUtileEnBase64] = jeton.split('.')
  if (!chargeUtileEnBase64) return null
  try {
    return JSON.parse(
      Buffer.from(chargeUtileEnBase64, 'base64').toString('utf8'),
    )
  } catch {
    return null
  }
}

export const expirationDuJeton = (jeton: string): Date | null => {
  const expiration = expirationEnSecondes(chargeUtileDe(jeton))
  return expiration === null ? null : new Date(expiration * 1000)
}
