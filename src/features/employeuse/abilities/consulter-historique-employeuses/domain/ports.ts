import type { HistoriqueDEmploiLu } from '../../../domain/consultation/emploi-lu'
import type { UtilisateurId } from '../../../domain/utilisateur-id'

export type LireLHistoriqueDEmploi = (
  utilisateurId: UtilisateurId,
) => Promise<HistoriqueDEmploiLu | null>

export type ConsulterHistoriqueEmployeusesPorts = {
  readonly lireLHistoriqueDEmploi: LireLHistoriqueDEmploi
}
