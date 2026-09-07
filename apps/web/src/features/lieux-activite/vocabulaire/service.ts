import { Service } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { pont } from './pont'

const table = {
  AideAuxDemarchesAdministratives: Service.AideAuxDemarchesAdministratives,
  MaitriseDesOutilsNumeriquesDuQuotidien:
    Service.MaitriseDesOutilsNumeriquesDuQuotidien,
  InsertionProfessionnelleViaLeNumerique:
    Service.InsertionProfessionnelleViaLeNumerique,
  AcquisitionDeMaterielInformatiqueAPrixSolidaire:
    Service.MaterielInformatiqueAPrixSolidaire,
  UtilisationSecuriseeDuNumerique: Service.UtilisationSecuriseeDuNumerique,
  ParentaliteEtEducationAvecLeNumerique:
    Service.ParentaliteEtEducationAvecLeNumerique,
  LoisirsEtCreationsNumeriques: Service.LoisirsEtCreationsNumeriques,
  ComprehensionDuMondeNumerique: Service.ComprehensionDuMondeNumerique,
  AccesInternetEtMaterielInformatique:
    Service.AccesInternetEtMaterielInformatique,
} satisfies Record<string, Service>

export type ServiceCoop = keyof typeof table

export const service = pont(Service, table)
