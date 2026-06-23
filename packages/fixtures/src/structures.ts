import { givenStructure } from '@app/fixtures/givenStructure'
import { type Prisma, Typologie } from '@prisma/client'

export const structureEmployeuse = givenStructure({
  id: 'f4dbca97-6fe8-4be1-97be-bdf5e66b9ea8',
  nom: 'Exemple de structure employeuse',
  adresse: '1 rue du vide',
  codePostal: '75001',
  codeInsee: '75101',
  commune: 'Paris 1er',
}) satisfies Prisma.StructureCreateInput

export const mediateque = givenStructure({
  id: '36929ed7-3b6f-4ed3-9924-b5e1a6c27096',
  nom: 'Exemple de Mediateque',
  adresse: '2 rue des livres',
  codePostal: '69002',
  codeInsee: '69382',
  commune: 'Lyon 2eme',
  typologies: [Typologie.BIB, Typologie.MUNI, Typologie.CIDFF],
})

export const centreSocial = givenStructure({
  id: '36f20d7e-90ed-4932-911a-55320617ad56',
  nom: 'Exemple de Centre Social',
  adresse: '3 rue des amis',
  codePostal: '75003',
  commune: 'Paris 3eme',
  codeInsee: '75103',
  typologies: [
    Typologie.PREVENTION,
    Typologie.REG,
    Typologie.CCAS,
    Typologie.CAARUD,
  ],
})

export const fixtureStructures = [structureEmployeuse, mediateque, centreSocial]

/**
 * Depuis le split 1a.2, le rôle EMPLOYEUSE (emplois.structureId, activites.structureEmployeuseId)
 * pointe vers `structure_administrative`, plus `structures`. On crée donc une SA (même id que la
 * structure, pour ne pas toucher les ~30 fixtures qui référencent `structure.id`) pour les
 * structures fixtures jouant ce rôle :
 *  - structureEmployeuse : employeuse pure (cible des emplois)
 *  - mediateque : double-rôle lieu + employeuse (cf. activites.ts structureEmployeuseId)
 * centreSocial reste un lieu pur → pas de SA.
 */
export const givenStructureAdministrative = (structure: {
  id: string
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee?: string | null
  siret?: string | null
}): Prisma.StructureAdministrativeCreateInput & { id: string } => ({
  id: structure.id,
  nom: structure.nom,
  adresse: structure.adresse,
  commune: structure.commune,
  codePostal: structure.codePostal,
  codeInsee: structure.codeInsee ?? null,
  siret: structure.siret ?? null,
  source: 'coop',
})

export const structureEmployeuseAdministrative =
  givenStructureAdministrative(structureEmployeuse)

export const mediatequeAdministrative = givenStructureAdministrative(mediateque)

export const fixtureStructuresAdministratives = [
  structureEmployeuseAdministrative,
  mediatequeAdministrative,
]

/** Lien du double-rôle : structure (lieu) → sa structure_administrative (employeuse) */
const administrativeIdByStructureId = new Map(
  fixtureStructuresAdministratives.map(({ id }) => [id, id]),
)

export const seedStructureAdministrative = (
  transaction: Prisma.TransactionClient,
  administrative: Prisma.StructureAdministrativeCreateInput & { id: string },
) =>
  transaction.structureAdministrative.upsert({
    where: { id: administrative.id },
    create: administrative,
    update: administrative,
    select: { id: true },
  })

export const seedStructures = async (transaction: Prisma.TransactionClient) => {
  await Promise.all(
    fixtureStructuresAdministratives.map((administrative) =>
      seedStructureAdministrative(transaction, administrative),
    ),
  )

  return Promise.all(
    fixtureStructures.map((structure) => {
      const administrativeId = administrativeIdByStructureId.get(structure.id)
      const data = administrativeId
        ? {
            ...structure,
            structureAdministrative: { connect: { id: administrativeId } },
          }
        : structure
      return transaction.structure.upsert({
        where: { id: structure.id },
        create: data,
        update: data,
        select: {
          id: true,
          nom: true,
        },
      })
    }),
  )
}
