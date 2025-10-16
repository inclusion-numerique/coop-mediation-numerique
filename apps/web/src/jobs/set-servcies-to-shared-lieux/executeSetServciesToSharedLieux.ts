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

  const privateLieux = await prisma.structure.findMany({
    where: {
      AND: [
        { visiblePourCartographieNationale: true },
        {
          services: {
            equals: ['AcquisitionDeMaterielInformatiqueAPrixSolidaire'],
          },
        },
      ],
    },
  })

  output(
    `Found ${privateLieux.length} private lieux to remove default services`,
  )

  for (const lieu of privateLieux) {
    await prisma.structure.update({
      where: { id: lieu.id },
      data: {
        services: [],
        visiblePourCartographieNationale: false,
      },
    })
  }

  output('Successfully set default services to lieux shared with cartographie')
}
