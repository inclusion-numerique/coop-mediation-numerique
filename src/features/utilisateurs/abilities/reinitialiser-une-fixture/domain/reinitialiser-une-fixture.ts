import {
  type NomAffiche,
  type UtilisateurId,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { CompteNonFixture, type EchecDeReinitialiserUneFixture } from './errors'
import type { ReinitialiserUneFixturePorts } from './ports'

export type FixtureReinitialisee = {
  readonly utilisateurId: UtilisateurId
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
    readonly utilisateurId: UtilisateurId | null
    readonly demonstration: Demonstration
  }): Promise<Result<FixtureReinitialisee, EchecDeReinitialiserUneFixture>> => {
    if (utilisateurId === null) return failure(UtilisateurIntrouvable())

    if (!(await estUneFixture(utilisateurId)))
      return failure(CompteNonFixture())

    return success({
      utilisateurId,
      nom: await reinitialiser(utilisateurId, demonstration),
    })
  }
