import {
  type NomAffiche,
  type UtilisateurId,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { CompteNonFixture, type EchecDeReinitialiserUneFixture } from './errors'
import type { MarquageFixture, ReinitialiserUneFixturePorts } from './ports'

export type FixtureReinitialisee = {
  readonly utilisateurId: UtilisateurId
  readonly nom: NomAffiche
}

const estUneFixture = ({
  persona,
  marqueCommeFixture,
}: MarquageFixture): boolean => persona && marqueCommeFixture

export const reinitialiserUneFixture =
  <Demonstration>({
    lireLeMarquageFixture,
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

    if (!estUneFixture(await lireLeMarquageFixture(utilisateurId)))
      return failure(CompteNonFixture())

    return success({
      utilisateurId,
      nom: await reinitialiser(utilisateurId, demonstration),
    })
  }
