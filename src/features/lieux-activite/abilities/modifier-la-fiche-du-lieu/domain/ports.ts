import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { EnregistrerLesSections } from '../../../domain/ports'
import type { FicheDuLieu } from './fiche-du-lieu'

export type ConsulterLaFicheDuLieu = (id: LieuId) => Promise<FicheDuLieu | null>

export type ModifierLaFicheDuLieuPorts = {
  readonly consulter: ConsulterLaFicheDuLieu
  readonly enregistrer: EnregistrerLesSections
}
