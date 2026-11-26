import { failure, type Result, success } from '@/libraries/result'
import {
  AucuneUsurpationEnCours,
  type EchecDeTerminerLUsurpation,
} from './errors'
import type { TerminerLUsurpationPorts } from './ports'
import { type SessionRendue, usurpateurARetrouver } from './session-courante'

export const terminerLUsurpation =
  ({ lireLaSession, rendreLaSession }: TerminerLUsurpationPorts) =>
  async ({
    jeton,
  }: {
    readonly jeton: string
  }): Promise<Result<SessionRendue, EchecDeTerminerLUsurpation>> => {
    const session = await lireLaSession(jeton)
    if (session === null) return failure(AucuneUsurpationEnCours())

    const usurpateur = usurpateurARetrouver(session)
    if (!usurpateur.success) return usurpateur

    const usurpateurId = usurpateur.data
    const nom = await rendreLaSession({ jeton, usurpateurId })

    return success({ jeton, usurpateurId, nom })
  }
