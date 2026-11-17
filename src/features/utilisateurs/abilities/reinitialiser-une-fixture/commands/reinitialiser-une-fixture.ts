import type { NomAffiche } from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { estUneFixture, reinitialiser } from '../implementation'

export type CompteNonFixture = { readonly _tag: 'CompteNonFixture' }

export const reinitialiserUneFixture = async (
  utilisateurId: string,
): Promise<Result<{ readonly nom: NomAffiche }, CompteNonFixture>> =>
  (await estUneFixture(utilisateurId))
    ? success({ nom: await reinitialiser(utilisateurId) })
    : failure({ _tag: 'CompteNonFixture' })
