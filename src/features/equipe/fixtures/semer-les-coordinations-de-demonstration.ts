import { prismaClient } from '@/configuration/prisma/prismaClient'
import { upsertCoordinationFixtures } from './enregistrer-les-coordinations'

export const semerLesCoordinationsDeDemonstration =
  upsertCoordinationFixtures(prismaClient)
