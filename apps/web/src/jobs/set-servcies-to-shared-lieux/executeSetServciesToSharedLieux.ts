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
      OR: [
        { visiblePourCartographieNationale: false },
        {
          AND: [
            {
              services: {
                equals: ['AcquisitionDeMaterielInformatiqueAPrixSolidaire'],
              },
            },
            { autresFormationsLabels: { has: 'Lieu privé' } },
          ],
        },
      ],
    },
  })

  output(
    `Found ${privateLieuxWithoutService.length} private lieux to remove default services`,
  )

  for (const lieu of privateLieuxWithoutService) {
    await prisma.structure.update({
      where: { id: lieu.id },
      data: {
        services: [],
        autresFormationsLabels: [],
        visiblePourCartographieNationale: false,
      },
    })
  }

  const lieuxWithWrongService = await prisma.structure.findMany({
    where: {
      visiblePourCartographieNationale: true,
      services: {
        has: 'AcquisitionDeMaterielInformatiqueAPrixSolidaire',
      },
      autresFormationsLabels: {
        has: 'Lieu privé',
      },
    },
  })

  output(
    `Found ${lieuxWithWrongService.length} lieux with extra services to clean`,
  )

  for (const lieu of lieuxWithWrongService) {
    await prisma.structure.update({
      where: { id: lieu.id },
      data: {
        services: lieu.services.filter(
          (s) => s !== 'AcquisitionDeMaterielInformatiqueAPrixSolidaire',
        ),
        autresFormationsLabels: lieu.autresFormationsLabels.filter(
          (l) => l !== 'Lieu privé',
        ),
      },
    })
  }

  const lieuxAvecLieuPrive = await prisma.structure.findMany({
    where: {
      autresFormationsLabels: {
        has: 'Lieu privé',
      },
    },
  })

  output(`Found ${lieuxAvecLieuPrive.length} lieux with "Lieu privé"`)

  for (const lieu of lieuxAvecLieuPrive) {
    await prisma.structure.update({
      where: { id: lieu.id },
      data: {
        autresFormationsLabels: lieu.autresFormationsLabels.filter(
          (label) => label !== 'Lieu privé',
        ),
      },
    })
  }

  output('Successfully set default services to lieux shared with cartographie')
}
