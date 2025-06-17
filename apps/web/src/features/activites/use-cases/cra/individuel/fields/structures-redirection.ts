import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { StructureDeRedirection } from '@prisma/client'

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

export const structuresRedirectionValues = Object.keys(
  structuresRedirectionLabels,
) as [StructureDeRedirection, ...StructureDeRedirection[]]

export const structureDeRedirectionApiValues = {
  OperateurOuOrganismeEnCharge: 'operateur_ou_organisme_en_charge',
  AideAuxDemarchesAdministratives: 'aide_aux_demarches_administratives',
  Administration: 'administration',
  MediationNumerique: 'mediation_numerique',
  AideSociale: 'aide_sociale',
  InsertionProfessionnelle: 'insertion_professionnelle',
  Autre: 'autre',
} as const satisfies {
  [key in StructureDeRedirection]: string
}
