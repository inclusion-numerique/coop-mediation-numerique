import type { Fiche } from '../../../domain/fiche'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { Lieu } from '../../../domain/lieu'
import type { EnregistrerLesSections } from '../../../domain/ports'

export type FichesAComparer = {
  readonly lieu: Lieu
  readonly ficheCoop: Fiche
}

type ConsulterLesFichesAComparer = (
  id: LieuId,
) => Promise<FichesAComparer | null>

export type AppliquerLesDifferencesPorts = {
  readonly consulter: ConsulterLesFichesAComparer
  readonly enregistrer: EnregistrerLesSections
}
