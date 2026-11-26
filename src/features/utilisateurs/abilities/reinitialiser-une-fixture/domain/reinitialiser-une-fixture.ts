import type { NomAffiche } from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { CompteNonFixture, type EchecDeReinitialiserUneFixture } from './errors'
import type { ReinitialiserUneFixturePorts } from './ports'

export type FixtureReinitialisee = {
  readonly utilisateurId: string
  readonly nom: NomAffiche
}

export const reinitialiserUneFixture =
  <Demonstration>({
    estUneFixture,
    reinitialiser,
  }: ReinitialiserUneFixturePorts<Demonstration>) =>
  async ({
    utilisateurId,
    demonstration,
  }: {
    readonly utilisateurId: string
    readonly demonstration: Demonstration
  }): Promise<Result<FixtureReinitialisee, EchecDeReinitialiserUneFixture>> =>
    (await estUneFixture(utilisateurId))
      ? success({
          utilisateurId,
          nom: await reinitialiser(utilisateurId, demonstration),
        })
      : failure(CompteNonFixture())
