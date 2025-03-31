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

  const lieuxToSetServices = await prisma.structure.findMany({
    where: {
      visiblePourCartographieNationale: true,
      services: { isEmpty: true },
    },
  })

  output(`Found ${lieuxToSetServices.length} lieux to set default services`)

  for (const lieu of lieuxToSetServices) {
    await prisma.structure.update({
      where: { id: lieu.id },
      data: {
        services: DEFAULT_SERVICES,
      },
    })
  }

  output('Successfully set default services to lieux shared with cartographie')
}
