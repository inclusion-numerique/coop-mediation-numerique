import { failure, type Result, success } from '@app/web/libraries/result'
import { type TerminerLUsurpationError, usurpateurARetrouver } from '../domain'
import { rendreLaSession, sessionCourante } from '../implementation'

export const terminerLUsurpation = async (
  jeton: string,
): Promise<Result<{ readonly nom: string }, TerminerLUsurpationError>> => {
  const session = await sessionCourante(jeton)
  if (session === null) return failure({ _tag: 'AucuneUsurpationEnCours' })

  const usurpateur = usurpateurARetrouver(session)
  if (!usurpateur.success) return usurpateur

  return success({
    nom: await rendreLaSession({ jeton, usurpateurId: usurpateur.data }),
  })
}
