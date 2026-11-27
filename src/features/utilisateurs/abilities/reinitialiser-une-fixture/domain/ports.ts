import type { NomAffiche, UtilisateurId } from '@/features/utilisateurs/domain'

export type MarquageFixture = {
  readonly persona: boolean
  readonly marqueCommeFixture: boolean
}

export type LireLeMarquageFixture = (
  utilisateurId: UtilisateurId,
) => Promise<MarquageFixture>

export type Reinitialiser<Demonstration> = (
  utilisateurId: UtilisateurId,
  demonstration: Demonstration,
) => Promise<NomAffiche>

export type ReinitialiserUneFixturePorts<Demonstration> = {
  readonly lireLeMarquageFixture: LireLeMarquageFixture
  readonly reinitialiser: Reinitialiser<Demonstration>
}
