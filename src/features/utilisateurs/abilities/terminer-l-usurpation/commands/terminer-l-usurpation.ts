import type { NomAffiche } from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { type TerminerLUsurpationError, usurpateurARetrouver } from '../domain'
import {
  rendreLaSession,
  sessionCourante,
} from '../implementations/prisma/session-courante'

export const terminerLUsurpation = async (
  jeton: string,
): Promise<Result<{ readonly nom: NomAffiche }, TerminerLUsurpationError>> => {
  const session = await sessionCourante(jeton)
  if (session === null) return failure({ _tag: 'AucuneUsurpationEnCours' })

  const usurpateur = usurpateurARetrouver(session)
  if (!usurpateur.success) return usurpateur

  return success({
    nom: await rendreLaSession({ jeton, usurpateurId: usurpateur.data }),
  })
}
