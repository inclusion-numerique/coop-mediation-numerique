import { prismaClient } from '@/configuration/prisma'
import { periodeEnCoursWhere } from '@/features/maintenance-mode/implementations/prisma/periode-de-maintenance.select'
import type { LireLaPeriodeEnCours } from '../../domain/ports'

export const lireLaPeriodeEnCours: LireLaPeriodeEnCours = async () =>
  prismaClient.maintenance.findFirst({
    where: periodeEnCoursWhere,
    orderBy: { startedAt: 'desc' },
    select: { id: true },
  })
