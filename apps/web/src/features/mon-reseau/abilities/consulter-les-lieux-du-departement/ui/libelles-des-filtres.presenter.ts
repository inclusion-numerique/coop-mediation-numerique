import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { EtiquetteDeFiltre } from '../../../ui/etiquette-de-filtre'
import type { CriteresDesLieux } from '../domain'

export const etiquettesDesCommunes = (
  { communes }: CriteresDesLieux,
  options: readonly SelectOption[],
): readonly EtiquetteDeFiltre[] =>
  options
    .filter(({ value }) => communes.some((commune) => commune === value))
    .map(({ label, value }) => ({
      parametre: 'communes',
      valeur: value,
      libelle: `Commune : ${label}`,
    }))
