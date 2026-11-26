import type { NomAffiche, UtilisateurId } from '@/features/utilisateurs/domain'

export type EstUneFixture = (utilisateurId: UtilisateurId) => Promise<boolean>

export type Reinitialiser<Demonstration> = (
  utilisateurId: UtilisateurId,
  demonstration: Demonstration,
) => Promise<NomAffiche>

export type ReinitialiserUneFixturePorts<Demonstration> = {
  readonly estUneFixture: EstUneFixture
  readonly reinitialiser: Reinitialiser<Demonstration>
}
