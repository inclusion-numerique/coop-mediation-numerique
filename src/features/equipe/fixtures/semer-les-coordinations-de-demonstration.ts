import { prismaClient } from '@/configuration/prisma/prisma-client'
import { enregistrerLesCoordinations } from './enregistrer-les-coordinations'

export const semerLesCoordinationsDeDemonstration =
  enregistrerLesCoordinations(prismaClient)
