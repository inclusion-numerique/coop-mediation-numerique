import type { NomAffiche } from '@/features/utilisateurs/domain'

export type EstUneFixture = (utilisateurId: string) => Promise<boolean>

export type Reinitialiser<Demonstration> = (
  utilisateurId: string,
  demonstration: Demonstration,
) => Promise<NomAffiche>

export type ReinitialiserUneFixturePorts<Demonstration> = {
  readonly estUneFixture: EstUneFixture
  readonly reinitialiser: Reinitialiser<Demonstration>
}
