import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { Lieu } from '../../../domain/lieu'
import type { FicheDuLieu } from './fiche-du-lieu'
import type { SectionDeLaFiche } from './modification-lieu'

export type ConsulterLaFicheDuLieu = (id: LieuId) => Promise<FicheDuLieu | null>

export type EnregistrerLesSections = (entree: {
  readonly lieu: Lieu
  readonly sections: readonly SectionDeLaFiche[]
  readonly maintenant: Date
}) => Promise<void>

export type ModifierLaFicheDuLieuPorts = {
  readonly consulter: ConsulterLaFicheDuLieu
  readonly enregistrer: EnregistrerLesSections
}
