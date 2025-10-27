import { SelectOption } from '@app/ui/components/Form/utils/options'
import {
  EchelonTerritorialValue,
  NaturePartenariatValue,
  TypeStructurePartenairesValue,
} from './validation/CraPartenariatValidation'

export const NATURE_OPTIONS: SelectOption<NaturePartenariatValue>[] = [
  { label: 'Conception de parcours usager', value: 'ParcoursUsager' },
  { label: 'Recherche de subvention', value: 'Subvention' },
  {
    label: 'Journée de coordination départementale',
    value: 'CoordinationDepartementale',
  },
  { label: 'Rendez-vous avec un·e élu·e', value: 'RDVElu' },
  { label: 'Autre', value: 'Autre' },
]

export const ECHELON_TERRITORIAL_OPTIONS: SelectOption<EchelonTerritorialValue>[] =
  [
    { label: 'Communal', value: 'Communal' },
    { label: 'Intercommunal', value: 'Intercommunal' },
    { label: 'Départemental', value: 'Departemental' },
    { label: 'Régional', value: 'Regional' },
    { label: 'National', value: 'National' },
  ]

export const TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS: SelectOption<
  TypeStructurePartenairesValue,
  { short: string }
>[] = [
  { label: 'Une commune', extra: { short: 'Commune' }, value: 'Commune' },
  { label: 'Un EPCI', extra: { short: 'EPCI' }, value: 'Epci' },
  {
    label: 'Le département',
    extra: { short: 'Département' },
    value: 'Departement',
  },
  { label: 'La région', extra: { short: 'Région' }, value: 'Region' },
  {
    label: 'Une association',
    extra: { short: 'Association' },
    value: 'Association',
  },
  {
    label: 'Une entreprise',
    extra: { short: 'Entreprise' },
    value: 'Entreprise',
  },
  { label: 'Un Hub', extra: { short: 'Hub' }, value: 'Hub' },
  {
    label: 'État (Préfecture, ANCT, Opérateur...)',
    extra: { short: 'État' },
    value: 'Etat',
  },
  {
    label: 'Un groupement (Syndicat mixte, consortium...)',
    value: 'Groupement',
  },
  { label: 'Autre', value: 'Autre' },
]
