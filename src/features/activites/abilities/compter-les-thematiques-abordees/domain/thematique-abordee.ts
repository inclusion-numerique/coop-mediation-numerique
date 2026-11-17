import type { Effectif, ThematiqueRecherchee } from '../../../domain'

export type ThematiqueAbordee = {
  readonly thematique: ThematiqueRecherchee
  readonly nombre: Effectif
}
