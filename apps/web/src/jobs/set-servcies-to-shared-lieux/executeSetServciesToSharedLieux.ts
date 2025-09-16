import { output } from '@app/cli/output'
import { PrismaClient, Service } from '@prisma/client'
import { SetServciesToSharedLieuxJob } from './setServciesToSharedLieuxJob'

const prisma = new PrismaClient()

const DEFAULT_SERVICES = [
  Service.AideAuxDemarchesAdministratives,
  Service.MaitriseDesOutilsNumeriquesDuQuotidien,
  Service.InsertionProfessionnelleViaLeNumerique,
  Service.UtilisationSecuriseeDuNumerique,
  Service.ParentaliteEtEducationAvecLeNumerique,
  Service.LoisirsEtCreationsNumeriques,
  Service.ComprehensionDuMondeNumerique,
]

export const executeSetServciesToSharedLieux = async (
  _job: SetServciesToSharedLieuxJob,
) => {
  output('Starting set default services to lieux shared with cartographie...')

  const sharedLieuxWithoutService = await prisma.structure.findMany({
    where: {
      visiblePourCartographieNationale: true,
      services: { isEmpty: true },
    },
  })

  output(
    `Found ${sharedLieuxWithoutService.length} shared lieux to set default services`,
  )

  for (const lieu of sharedLieuxWithoutService) {
    await prisma.structure.update({
      where: { id: lieu.id },
      data: {
        services: DEFAULT_SERVICES,
      },
    })
  }

  const privateLieuxWithoutService = await prisma.structure.findMany({
    where: {
      visiblePourCartographieNationale: false,
      services: { isEmpty: true },
    },
  })

  output(
    `Found ${privateLieuxWithoutService.length} private lieux to set default services`, // todo: change message to ...private lieux to remove default services
  )

  // todo:
  //  - Si un lieu partagé avec la cartographie n'a que le service "AcquisitionDeMaterielInformatiqueAPrixSolidaire" et le label "Lieu privé", alors c'est un lieu privé, il faut lui enlever ce service et ce label et mettre visiblePourCartographieNationale à false
  //  - Si un lieu partagé avec la cartographie a le service "AcquisitionDeMaterielInformatiqueAPrixSolidaire" en plus d'autres services, et le label "Lieu privé", alors c'est un lieu partagé qui ne propose probablement pas ce service, il faut lui enlever ce service et ce label, mais laisser les autres services et labels, et laisser visiblePourCartographieNationale à true
  for (const lieu of privateLieuxWithoutService) {
    await prisma.structure.update({
      where: { id: lieu.id },
      data: {
        services: [Service.AcquisitionDeMaterielInformatiqueAPrixSolidaire], // todo: remove services to private lieux
        autresFormationsLabels: ['Lieu privé'], // todo: remove autres formations labels to private lieux
      },
    })
  }

  output('Successfully set default services to lieux shared with cartographie')
}
