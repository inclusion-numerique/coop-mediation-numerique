const MARGE_DE_DECALAGE_D_HORLOGE_EN_SECONDES = 3

const expirationDe = (chargeUtile: unknown): number | null =>
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

export const jetonNonExpire = (
  jeton: string,
  maintenantEnSecondes: number,
): boolean => {
  const expiration = expirationDe(chargeUtileDe(jeton))
  return (
    expiration !== null &&
    expiration > maintenantEnSecondes + MARGE_DE_DECALAGE_D_HORLOGE_EN_SECONDES
  )
}

export type JetonsProconnect = {
  readonly idToken: string | null
  readonly refreshToken: string | null
}
