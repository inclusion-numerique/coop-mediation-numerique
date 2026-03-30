import {
  CartoStructure,
  CreatedActivite,
  CreateMediateurEnActivite,
  CreateStructureFromCarto,
  CreateStructureFromData,
  ExistingLieuxActivite,
  FindCartoStructure,
  FindExistingLieuxActivite,
  FindStructuresByCartoIds,
  StructureToCreate,
} from '../domain'

type InMemoryStructure = {
  id: string
  cartoId: string | null
  nom: string
  siret?: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee?: string
}

type InMemoryActivite = {
  id: string
  mediateurId: string
  structureId: string
  userId: string
}

const structures = new Map<string, InMemoryStructure>()
const activites = new Map<string, InMemoryActivite>()
const cartoStructures = new Map<string, CartoStructure>()
const userMediateurMap = new Map<string, string>()

export const seedStructure = (structure: InMemoryStructure) => {
  structures.set(structure.id, structure)
}

export const seedActivite = (activite: InMemoryActivite) => {
  activites.set(activite.id, activite)
}

export const seedCartoStructure = (cartoStructure: CartoStructure) => {
  cartoStructures.set(cartoStructure.id, cartoStructure)
}

export const seedUserMediateur = (userId: string, mediateurId: string) => {
  userMediateurMap.set(userId, mediateurId)
}

export const clearStores = () => {
  structures.clear()
  activites.clear()
  cartoStructures.clear()
  userMediateurMap.clear()
}

export const getStructures = () => new Map(structures)
export const getActivites = () => new Map(activites)

export const findExistingActivites: FindExistingLieuxActivite = async (
  userId,
): Promise<ExistingLieuxActivite[]> => {
  const result: ExistingLieuxActivite[] = []

  for (const activite of activites.values()) {
    if (activite.userId === userId) {
      const structure = structures.get(activite.structureId)
      if (structure) {
        result.push({
          structureId: structure.id,
          cartoId: structure.cartoId,
        })
      }
    }
  }

  return result
}

export const findStructuresByCartoIds: FindStructuresByCartoIds = async (
  cartoIds,
): Promise<Map<string, string>> => {
  const result = new Map<string, string>()

  for (const structure of structures.values()) {
    if (structure.cartoId && cartoIds.includes(structure.cartoId)) {
      result.set(structure.cartoId, structure.id)
    }
  }

  return result
}

export const findCartoStructure: FindCartoStructure = async (cartoId) =>
  cartoStructures.get(cartoId) ?? null

export const createStructureFromData: CreateStructureFromData = async (
  data: StructureToCreate,
) => {
  const id = crypto.randomUUID()
  const structure: InMemoryStructure = {
    id,
    cartoId: null,
    nom: data.nom,
    siret: data.siret,
    adresse: data.adresse,
    commune: data.commune,
    codePostal: data.codePostal,
    codeInsee: data.codeInsee,
  }
  structures.set(id, structure)
  return { id }
}

export const createStructureFromCarto: CreateStructureFromCarto = async (
  cartoStructure,
) => {
  const id = crypto.randomUUID()
  const structure: InMemoryStructure = {
    id,
    cartoId: cartoStructure.id,
    nom: cartoStructure.nom,
    adresse: cartoStructure.adresse,
    commune: cartoStructure.commune,
    codePostal: cartoStructure.codePostal,
    codeInsee: cartoStructure.codeInsee ?? undefined,
  }
  structures.set(id, structure)
  return { id }
}

export const createMediateurEnActivite: CreateMediateurEnActivite = async (
  mediateurId,
  structureId,
): Promise<CreatedActivite> => {
  const id = crypto.randomUUID()

  let userId = ''
  for (const [uId, mId] of userMediateurMap.entries()) {
    if (mId === mediateurId) {
      userId = uId
      break
    }
  }

  const activite: InMemoryActivite = {
    id,
    mediateurId,
    structureId,
    userId,
  }
  activites.set(id, activite)
  return { id, structureId }
}
