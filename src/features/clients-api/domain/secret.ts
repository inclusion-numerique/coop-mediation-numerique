type SecretGenere = {
  readonly secret: string
  readonly secretHash: string
}

export type GenererUnSecret = () => SecretGenere

export type VerifierUnSecret = (secret: string, secretHash: string) => boolean
