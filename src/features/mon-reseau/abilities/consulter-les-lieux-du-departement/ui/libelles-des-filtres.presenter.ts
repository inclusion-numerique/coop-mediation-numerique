import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { pluriel } from '@app/web/libraries/pluriel'
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

export const libelleDesResultats = (total: number, filtre: boolean): string =>
  total > 0
    ? `${total} ${pluriel(total, 'lieu', 'lieux')}`
    : filtre
      ? 'Aucun lieu ne correspond à votre recherche'
      : 'Aucun lieu référencé'

export const parametresDeLURL = ({
  recherche,
  communes,
  tri,
  page,
  lignes,
}: CriteresDesLieux) => ({
  recherche: recherche ?? undefined,
  communes: communes.length === 0 ? undefined : communes.join(','),
  tri,
  page: String(page),
  lignes: String(lignes),
})
