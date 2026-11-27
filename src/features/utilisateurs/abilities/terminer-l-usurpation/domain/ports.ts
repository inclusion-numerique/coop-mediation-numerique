import type { NomAffiche, UtilisateurId } from '@/features/utilisateurs/domain'
import type { SessionCourante } from './session-courante'

type LireLaSession = (jeton: string) => Promise<SessionCourante | null>

type RendreLaSession = (session: {
  readonly jeton: string
  readonly usurpateurId: UtilisateurId
}) => Promise<NomAffiche>

export type TerminerLUsurpationPorts = {
  readonly lireLaSession: LireLaSession
  readonly rendreLaSession: RendreLaSession
}
