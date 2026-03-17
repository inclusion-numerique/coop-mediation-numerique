import type { Prisma } from '@prisma/client'

export const mergeStructureInclude = {
  emplois: {
    where: { suppression: null },
    select: { userId: true },
  },
  mediateursEnActivite: {
    where: { suppression: null },
    select: { mediateurId: true },
  },
  activitesEmployes: {
    where: { suppression: null },
    select: { id: true },
  },
  activites: {
    where: { suppression: null },
    select: { id: true },
  },
} satisfies Prisma.StructureInclude

export type MergeStructure = Prisma.StructureGetPayload<{
  include: typeof mergeStructureInclude
}>

export type MergeStructureData = {
  employesIds: string[]
  mediateursEnActiviteIds: string[]
  activitesEmployeurIds: string[]
  activitesLieuIds: string[]
  typologies: string[]
  services: string[]
  publicsSpecifiquementAdresses: string[]
  priseEnChargeSpecifique: string[]
  fraisACharge: string[]
  dispositifProgrammesNationaux: string[]
  formationsLabels: string[]
  autresFormationsLabels: string[]
  itinerance: string[]
  modalitesAcces: string[]
  modalitesAccompagnement: string[]
  courriels: string[]
}

export type MergeStructureInfo = MergeStructureData & {
  id: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  siret: string | null
  rna: string | null
  structureCartographieNationaleId: string | null
}
