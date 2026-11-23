import type { NomAffiche } from '@/features/utilisateurs/domain'
import type { DonneesDeDemonstration } from '@/features/utilisateurs/fixtures/reinitialiser-un-utilisateur'
import { failure, type Result, success } from '@/libraries/result'
import { estUneFixture, reinitialiser } from '../implementations'

export type CompteNonFixture = { readonly _tag: 'CompteNonFixture' }

export const reinitialiserUneFixture = async (
  utilisateurId: string,
  demonstration: DonneesDeDemonstration,
): Promise<Result<{ readonly nom: NomAffiche }, CompteNonFixture>> =>
  (await estUneFixture(utilisateurId))
    ? success({ nom: await reinitialiser(utilisateurId, demonstration) })
    : failure({ _tag: 'CompteNonFixture' })
