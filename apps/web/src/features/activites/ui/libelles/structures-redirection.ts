import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { STRUCTURES_DE_REDIRECTION } from '../../domain'

export const structuresRedirectionValues = STRUCTURES_DE_REDIRECTION

export type StructureDeRedirection =
  (typeof structuresRedirectionValues)[number]

export const structuresRedirectionLabels: {
  [key in StructureDeRedirection]: string
} = {
  Administration: 'Administration (mairie, préfecture…)',
  MediationNumerique: 'Autre structure de médiation numérique',
  OperateurOuOrganismeEnCharge:
    'Opérateur ou organisme en charge de la démarche administrative',
  AideSociale:
    'Structure d’aide sociale (maison des solidarités, centre social…)',
  InsertionProfessionnelle:
    'Structure d’insertion professionnelle (France Travail, mission locale, chambre de commerce…)',
  AideAuxDemarchesAdministratives:
    'Structure d’aide aux démarches administratives (France Services…)',
  Autre: 'Autre',
}

export const structuresRedirectionOptions = labelsToOptions(
  structuresRedirectionLabels,
)
