import { SelectOption } from '@app/ui/components/Form/utils/options'
import {
  EchelonTerritorialValue,
  OrganisateursValue,
  TypeEvenementValue,
} from './validation/CraEvenementValidation'

export const TYPE_EVENEMENT_OPTIONS: SelectOption<TypeEvenementValue>[] = [
  {
    label:
      'Évènement grand public (Ex : Forums, salons, journées départementales, ateliers collectifs...)',
    value: 'GrandPublic',
  },
  {
    label: 'Évènement national (Ex : NEC, ANCTour, etc...)',
    value: 'National',
  },
  {
    label:
      'Journée d’inclusion numérique (Ex : Séminaire, rencontre, intervention...)',
    value: 'InclusionNumerique',
  },
  { label: 'NEC local', value: 'NecLocal' },
  { label: 'Autre', value: 'Autre' },
]

export const ORGANISATEURS_OPTIONS: SelectOption<OrganisateursValue>[] = [
  { label: 'Ma structure (moi - même)', value: 'MaStructure' },
  { label: 'Une commune', value: 'Commune' },
  { label: 'Un EPCI', value: 'Epci' },
  { label: 'Le département', value: 'Departement' },
  { label: 'La région', value: 'Region' },
  { label: 'Une association', value: 'Association' },
  { label: 'Une entreprise', value: 'Entreprise' },
  { label: 'Un Hub', value: 'Hub' },
  { label: 'État (Préfecture, ANCT, Opérateur...)', value: 'Etat' },
  {
    label: 'Un groupement (Syndicat mixte, consortium...)',
    value: 'Groupement',
  },
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
