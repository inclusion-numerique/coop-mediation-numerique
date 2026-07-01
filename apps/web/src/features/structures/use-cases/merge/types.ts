import type { Prisma } from '@prisma/client'

// Les relations employeuse (emplois, activités employeur) vivent sur
// structure_administrative, sans lien FK avec le lieu : la prévisualisation les récupère
// par corrélation nom + code INSEE (getCorrelatedEmployeuseRelations), pas via l'include.
// La fusion de deux structures dont les employeuses corrélées diffèrent reste ambiguë.
export const mergeStructureInclude = {
  mediateursEnActivite: {
    where: { suppression: null },
    select: { mediateurId: true },
  },
  activites: {
    where: { suppression: null },
    select: { id: true },
  },
} satisfies Prisma.LieuInclusionInclude

export type MergeStructure = Prisma.LieuInclusionGetPayload<{
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
