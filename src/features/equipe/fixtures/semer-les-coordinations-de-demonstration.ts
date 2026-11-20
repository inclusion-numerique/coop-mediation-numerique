import { prismaClient } from '@/configuration/prisma/prismaClient'
import { upsertCoordinationFixtures } from './upsertCoordinationFixture'

export const semerLesCoordinationsDeDemonstration =
  upsertCoordinationFixtures(prismaClient)
