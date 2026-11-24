import type { SelectOption } from '@/libraries/ui/components/form/utils/options'
import type { LieuDesStatistiques } from '../../domain'
import { optionDeLieu } from './options-de-lieux.presenter'

type LieuxDuFiltre = {
  readonly suggestions: {
    readonly lieux: readonly LieuDesStatistiques[]
    readonly communes: readonly LieuDesStatistiques[]
    readonly departements: readonly LieuDesStatistiques[]
  }
  readonly choisis: readonly LieuDesStatistiques[]
}

export type OptionsDesLieux = {
  readonly lieux: readonly SelectOption[]
  readonly communes: readonly SelectOption[]
  readonly departements: readonly SelectOption[]
}

const GENRE_DE_LA_CLE = {
  lieux: 'LieuDActivite',
  communes: 'Commune',
  departements: 'Departement',
} as const

const duGenre =
  (lieux: readonly LieuDesStatistiques[]) =>
  (cle: keyof typeof GENRE_DE_LA_CLE): readonly SelectOption[] =>
    lieux
      .filter(({ genre }) => genre === GENRE_DE_LA_CLE[cle])
      .map(optionDeLieu)

const optionsParCle = (
  options: (cle: keyof typeof GENRE_DE_LA_CLE) => readonly SelectOption[],
): OptionsDesLieux => ({
  lieux: options('lieux'),
  communes: options('communes'),
  departements: options('departements'),
})

const libelles = (options: readonly SelectOption[]) =>
  new Map(options.map(({ value, label }) => [value, label]))

export const lieuxDuFiltrePresentes = ({
  suggestions,
  choisis,
}: LieuxDuFiltre) => {
  const choisies = optionsParCle(duGenre(choisis))
  return {
    suggestions: optionsParCle((cle) => suggestions[cle].map(optionDeLieu)),
    choisies,
    libelles: {
      lieux: libelles(choisies.lieux),
      communes: libelles(choisies.communes),
      departements: libelles(choisies.departements),
    },
  }
}
