import type { RevocationDesPartages } from './revocation-des-partages'

export type RevoquerLesPartages = (
  revocation: RevocationDesPartages,
) => Promise<{ readonly partagesRevoques: number }>

export type RevoquerPartageStatistiquesPorts = {
  readonly revoquerLesPartages: RevoquerLesPartages
}
