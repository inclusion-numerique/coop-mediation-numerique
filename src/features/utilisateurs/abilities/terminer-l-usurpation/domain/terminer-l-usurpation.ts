import type { NomAffiche, UtilisateurId } from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import {
  type SessionCourante,
  type TerminerLUsurpationError,
  usurpateurARetrouver,
} from './session-courante'

export type TerminerLUsurpationPorts = {
  readonly lireLaSession: (jeton: string) => Promise<SessionCourante | null>
  readonly rendreLaSession: (session: {
    readonly jeton: string
    readonly usurpateurId: UtilisateurId
  }) => Promise<NomAffiche>
}

export const terminerLUsurpation =
  ({ lireLaSession, rendreLaSession }: TerminerLUsurpationPorts) =>
  async (
    jeton: string,
  ): Promise<
    Result<{ readonly nom: NomAffiche }, TerminerLUsurpationError>
  > => {
    const session = await lireLaSession(jeton)
    if (session === null) return failure({ _tag: 'AucuneUsurpationEnCours' })

    const usurpateur = usurpateurARetrouver(session)
    if (!usurpateur.success) return usurpateur

    return success({
      nom: await rendreLaSession({ jeton, usurpateurId: usurpateur.data }),
    })
  }
