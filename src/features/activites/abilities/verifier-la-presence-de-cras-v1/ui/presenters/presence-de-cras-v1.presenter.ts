import type { PresenceDeCrasV1 } from '../../domain'

export const presenceDeCrasV1Presentee = ({
  data,
}: {
  readonly success: boolean
  readonly data?: PresenceDeCrasV1
}): { readonly hasCrasV1: boolean } => ({ hasCrasV1: data === 'Presents' })
