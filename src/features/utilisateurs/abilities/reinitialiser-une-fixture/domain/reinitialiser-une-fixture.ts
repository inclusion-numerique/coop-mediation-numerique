import type { NomAffiche } from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'

export type CompteNonFixture = { readonly _tag: 'CompteNonFixture' }

export type ReinitialiserUneFixturePorts<Demonstration> = {
  readonly estUneFixture: (utilisateurId: string) => Promise<boolean>
  readonly reinitialiser: (
    utilisateurId: string,
    demonstration: Demonstration,
  ) => Promise<NomAffiche>
}

export const reinitialiserUneFixture =
  <Demonstration>({
    estUneFixture,
    reinitialiser,
  }: ReinitialiserUneFixturePorts<Demonstration>) =>
  async (
    utilisateurId: string,
    demonstration: Demonstration,
  ): Promise<Result<{ readonly nom: NomAffiche }, CompteNonFixture>> =>
    (await estUneFixture(utilisateurId))
      ? success({ nom: await reinitialiser(utilisateurId, demonstration) })
      : failure({ _tag: 'CompteNonFixture' })
