import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { Service } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Service as PrismaService } from '@prisma/client'

export const serviceLabels: Record<PrismaService, Service> = {
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

export type ServiceLabel = keyof typeof serviceLabels

export const serviceValues = Object.keys(serviceLabels) as [
  ServiceLabel,
  ...ServiceLabel[],
]

export const serviceOptions = labelsToOptions(serviceLabels)
