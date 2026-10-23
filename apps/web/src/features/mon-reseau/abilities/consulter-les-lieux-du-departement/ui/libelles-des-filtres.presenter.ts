import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { CriteresDesLieux } from '../domain'

export type EtiquetteDeFiltre = {
  readonly cle: string
  readonly libelle: string
}

export const etiquettesDesCommunes = (
  { communes }: CriteresDesLieux,
  options: readonly SelectOption[],
): readonly EtiquetteDeFiltre[] =>
  options
    .filter(({ value }) => communes.some((commune) => commune === value))
    .map(({ label, value }) => ({ cle: value, libelle: `Commune : ${label}` }))
