import type { ProprietairePartage } from '@/features/mediateurs/domain'

export type RevocationDesPartages = {
  readonly proprietaires: readonly ProprietairePartage[]
  readonly revoqueLe: Date
}

export type PartagesRevoques = RevocationDesPartages & {
  readonly partagesRevoques: number
}
