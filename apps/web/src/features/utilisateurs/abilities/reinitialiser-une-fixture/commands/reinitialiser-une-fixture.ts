import { failure, type Result, success } from '@app/web/libraries/result'
import { estUneFixture, reinitialiser } from '../implementation'

export type CompteNonFixture = { readonly _tag: 'CompteNonFixture' }

export const reinitialiserUneFixture = async (
  utilisateurId: string,
): Promise<Result<{ readonly nom: string }, CompteNonFixture>> =>
  (await estUneFixture(utilisateurId))
    ? success({ nom: await reinitialiser(utilisateurId) })
    : failure({ _tag: 'CompteNonFixture' })
