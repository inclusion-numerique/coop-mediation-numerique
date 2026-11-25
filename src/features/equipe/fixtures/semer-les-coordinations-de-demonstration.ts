import { prismaClient } from '@/configuration/prisma'
import { enregistrerLesCoordinations } from './enregistrer-les-coordinations'

export const semerLesCoordinationsDeDemonstration =
  enregistrerLesCoordinations(prismaClient)
