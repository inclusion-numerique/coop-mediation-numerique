import type { NomAffiche, UtilisateurId } from '@/features/utilisateurs/domain'
import type { SessionCourante } from './session-courante'

export type LireLaSession = (jeton: string) => Promise<SessionCourante | null>

export type RendreLaSession = (session: {
  readonly jeton: string
  readonly usurpateurId: UtilisateurId
}) => Promise<NomAffiche>

export type TerminerLUsurpationPorts = {
  readonly lireLaSession: LireLaSession
  readonly rendreLaSession: RendreLaSession
}
