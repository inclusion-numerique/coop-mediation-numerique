import { valeurDe } from '../../../../../../libraries/collections'
import { thematiqueLabels } from '../../../../ui/labels/libelles/thematique.labels'
import type { ThematiqueAbordee } from '../../domain'

export type ThematiqueAbordeePresentee = {
  readonly thematique: string
  readonly libelle: string
  readonly nombre: number
}

export const thematiquesAbordeesPresentees = (
  thematiques: readonly ThematiqueAbordee[],
): readonly ThematiqueAbordeePresentee[] =>
  thematiques
    .map(({ thematique, nombre }) => ({
      thematique,
      libelle: valeurDe(thematiqueLabels)(thematique),
      nombre,
    }))
    .toSorted((une, autre) => une.libelle.localeCompare(autre.libelle))
