import { Service } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Service as ServiceCoop } from '@prisma/client'
import { pont } from './pont'

const table: Record<ServiceCoop, Service> = {
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
}

export const service = pont(table)
