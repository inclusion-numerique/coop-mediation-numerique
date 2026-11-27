import { prismaClient } from '@/configuration/prisma'
import {
  clientApiSelect,
  versClientApi,
} from '@/features/clients-api/implementations/prisma/client-api.transfer'
import type { LireLeClientApiAAuthentifier } from '../../domain/ports'

export const lireLeClientApiAAuthentifier: LireLeClientApiAAuthentifier =
  async (id) => {
    const ligne = await prismaClient.apiClient.findUnique({
      where: { id },
      select: { ...clientApiSelect, secretHash: true },
    })

    return ligne === null
      ? null
      : { ...versClientApi(ligne), secretHash: ligne.secretHash }
  }
