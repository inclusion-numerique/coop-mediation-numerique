import { prismaClient } from '@/configuration/prisma/prismaClient'
import { enregistrerLesCoordinations } from './enregistrer-les-coordinations'

export const semerLesCoordinationsDeDemonstration =
  enregistrerLesCoordinations(prismaClient)
