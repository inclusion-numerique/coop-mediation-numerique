import type { UtilisateurId } from '@/features/mediateurs/domain'
import type { LigneDeContrat } from './contrat'

export type LireLesContrats = (
  utilisateurId: UtilisateurId,
) => Promise<readonly LigneDeContrat[]>

export type ConsulterLeContratPorts = {
  readonly lireLesContrats: LireLesContrats
}
