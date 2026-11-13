import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { LieuDesStatistiques } from '../domain'

export const optionDeLieu = (lieu: LieuDesStatistiques): SelectOption =>
  lieu.genre === 'LieuDActivite'
    ? { value: lieu.id, label: lieu.nom }
    : lieu.genre === 'Commune'
      ? {
          value: lieu.commune.codeInsee,
          label: `${lieu.commune.nom} · ${lieu.commune.codePostal}`,
        }
      : {
          value: lieu.departement.code,
          label: `${lieu.departement.code} · ${lieu.departement.nom}`,
        }

const duGenre =
  (genre: LieuDesStatistiques['genre']) =>
  (lieux: readonly LieuDesStatistiques[]): SelectOption[] =>
    lieux.filter((lieu) => lieu.genre === genre).map(optionDeLieu)

export const optionsDesLieuxChoisis = (
  lieux: readonly LieuDesStatistiques[],
): {
  readonly lieuxActiviteOptions: SelectOption[]
  readonly communesOptions: SelectOption[]
  readonly departementsOptions: SelectOption[]
} => ({
  lieuxActiviteOptions: duGenre('LieuDActivite')(lieux),
  communesOptions: duGenre('Commune')(lieux),
  departementsOptions: duGenre('Departement')(lieux),
})
