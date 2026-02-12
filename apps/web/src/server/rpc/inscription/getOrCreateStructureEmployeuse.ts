import type { SessionUser } from '@app/web/auth/sessionUser'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import type { Typologie } from '@prisma/client'
import { v4 } from 'uuid'

type StructureEmployeuseWithAdresseBan = {
  id?: string | null
  nom: string
  adresseBan: AdresseBanData
  siret: string
  typologies?: string[] | null
}

type StructureEmployeuseWithSeparateFields = {
  id?: string | null
  nom: string
  adresse: string
  commune: string
  codeInsee: string
  siret: string
  codePostal?: string | null
  typologies?: string[] | null
}

type StructureEmployeuseInput =
  | StructureEmployeuseWithAdresseBan
  | StructureEmployeuseWithSeparateFields

const hasAdresseBan = (
  input: StructureEmployeuseInput,
): input is StructureEmployeuseWithAdresseBan => 'adresseBan' in input

export const getOrCreateStructureEmployeuse = async (
  structureEmployeuse: StructureEmployeuseInput,
  user?: SessionUser,
) => {
  const { siret, nom, id, typologies } = structureEmployeuse

  const adresse = hasAdresseBan(structureEmployeuse)
    ? structureEmployeuse.adresseBan.nom
    : structureEmployeuse.adresse
  const commune = hasAdresseBan(structureEmployeuse)
    ? structureEmployeuse.adresseBan.commune
    : structureEmployeuse.commune
  const codeInsee = hasAdresseBan(structureEmployeuse)
    ? structureEmployeuse.adresseBan.codeInsee
    : structureEmployeuse.codeInsee
  const codePostal = hasAdresseBan(structureEmployeuse)
    ? structureEmployeuse.adresseBan.codePostal
    : (structureEmployeuse.codePostal ?? '')
  const longitude = hasAdresseBan(structureEmployeuse)
    ? structureEmployeuse.adresseBan.longitude
    : undefined
  const latitude = hasAdresseBan(structureEmployeuse)
    ? structureEmployeuse.adresseBan.latitude
    : undefined

  const existingStructure = await prismaClient.structure.findFirst({
    where: {
      id: id ?? undefined,
      siret,
      nom,
      adresse,
      commune,
      codeInsee,
      suppression: null,
    },
    select: {
      id: true,
    },
  })

  if (existingStructure) {
    return existingStructure
  }

  addMutationLog({
    userId: user?.id,
    nom: 'CreerStructure',
    duration: 0,
    data: {
      nom,
      siret,
      adresse,
      commune,
      codePostal,
      codeInsee,
      typologies,
    },
  })

  return prismaClient.structure.create({
    data: {
      id: v4(),
      siret,
      codeInsee,
      nom,
      adresse,
      commune,
      codePostal,
      longitude,
      latitude,
      typologies: (typologies as Typologie[]) ?? undefined,
      creationParId: user?.id,
    },
  })
}
