import type { Prisma } from '@prisma/client'

// TODO(split-1a.2): emplois et activités employeur vivent désormais sur
// structure_administrative (lien 1:1). La fusion de deux structures dont les SA
// diffèrent est ambiguë et reste à clarifier ; on collecte ici les ids via le lien.
export const mergeStructureInclude = {
  structureAdministrative: {
    select: {
      emplois: {
        where: { suppression: null },
        select: { userId: true },
      },
      activites: {
        where: { suppression: null },
        select: { id: true },
      },
    },
  },
  mediateursEnActivite: {
    where: { suppression: null },
    select: { mediateurId: true },
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
