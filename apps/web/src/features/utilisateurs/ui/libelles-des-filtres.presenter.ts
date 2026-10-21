import type { SelectOption } from '@app/ui/components/Form/utils/options'
import {
  type Dispositif,
  type FiltresUtilisateurs,
  filtresStatut,
  type RoleFiltre,
  rolesFiltres,
  statutDuFiltre,
} from '@app/web/features/utilisateurs/domain'
import { libelleDuStatut } from './statut-compte.presenter'

export type TypeDeFiltre =
  | 'roles'
  | 'conseiller_numerique'
  | 'statut'
  | 'employeuses'
  | 'lieux'
  | 'communes'
  | 'departements'

export type LibelleDeFiltre = {
  readonly type: TypeDeFiltre
  readonly cle: string
  readonly valeur: string
  readonly libelle: string
}

const libelleParRole: Record<(typeof rolesFiltres)[number], string> = {
  mediateur: 'Médiateur',
  coordinateur: 'Coordinateur',
  administrateur: 'Administrateur',
}

export const libelleDuRole = (role: (typeof rolesFiltres)[number]): string =>
  libelleParRole[role]

export const optionsDesRoles: readonly SelectOption[] = rolesFiltres.map(
  (role) => ({ value: role, label: libelleDuRole(role) }),
)

export const libelleDuFiltreStatut = (
  filtre: (typeof filtresStatut)[number],
): string => libelleDuStatut(statutDuFiltre(filtre))

export const optionsDesStatuts: readonly SelectOption[] = filtresStatut.map(
  (filtre) => ({ value: filtre, label: libelleDuFiltreStatut(filtre) }),
)

const libelleDuDispositif = (dispositif: Dispositif): string =>
  dispositif === 'ConseillerNumerique'
    ? 'Conseiller numérique'
    : 'Hors dispositif'

export const optionsDesDispositifs: readonly SelectOption[] = [
  { value: '1', label: 'Conseiller numérique' },
  { value: '0', label: 'Hors dispositif' },
]

export type OptionsDesFiltres = {
  readonly employeuses: readonly SelectOption[]
  readonly lieux: readonly SelectOption[]
  readonly communes: readonly SelectOption[]
  readonly departements: readonly SelectOption[]
}

const prefixes: Partial<Record<TypeDeFiltre, string>> = {
  employeuses: 'Employeuse : ',
  lieux: 'Lieu d’activité : ',
  communes: 'Commune : ',
  departements: 'Département : ',
}

const libellesParmi =
  (type: TypeDeFiltre, options: readonly SelectOption[]) =>
  (choisis: readonly (string | number)[]): readonly LibelleDeFiltre[] =>
    options
      .filter(({ value }) => choisis.map(String).includes(value))
      .map(({ value, label }) => ({
        type,
        cle: value,
        valeur: label,
        libelle: `${prefixes[type] ?? ''}${label}`,
      }))

const libelleDesRoles = (
  roles: readonly RoleFiltre[],
): readonly LibelleDeFiltre[] =>
  roles.map((role) => ({
    type: 'roles',
    cle: role,
    valeur: libelleDuRole(role),
    libelle: libelleDuRole(role),
  }))

export const libellesDesFiltres = (
  filtres: FiltresUtilisateurs,
  options: OptionsDesFiltres,
): readonly LibelleDeFiltre[] => [
  ...libelleDesRoles(filtres.roles),
  ...(filtres.dispositif === null
    ? []
    : [
        {
          type: 'conseiller_numerique' as const,
          cle: filtres.dispositif === 'ConseillerNumerique' ? '1' : '0',
          valeur: libelleDuDispositif(filtres.dispositif),
          libelle: libelleDuDispositif(filtres.dispositif),
        },
      ]),
  ...(filtres.statut === null
    ? []
    : [
        {
          type: 'statut' as const,
          cle: filtres.statut,
          valeur: libelleDuFiltreStatut(filtres.statut),
          libelle: libelleDuFiltreStatut(filtres.statut),
        },
      ]),
  ...libellesParmi('employeuses', options.employeuses)(filtres.employeuses),
  ...libellesParmi('lieux', options.lieux)(filtres.lieux),
  ...libellesParmi('communes', options.communes)(filtres.communes),
  ...libellesParmi('departements', options.departements)(filtres.departements),
]
