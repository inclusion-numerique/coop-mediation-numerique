import { enSerie } from '@app/fixtures/enSerie'
import { givenLieuInclusion } from '@app/fixtures/givenLieuInclusion'
import { type Prisma, Typologie } from '@app/web/generated/prisma/browser'

export const structureEmployeuse = givenLieuInclusion({
  id: 'f4dbca97-6fe8-4be1-97be-bdf5e66b9ea8',
  nom: 'Exemple de structure employeuse',
  adresse: '1 rue du vide',
  codePostal: '75001',
  codeInsee: '75101',
  commune: 'Paris 1er',
  banId: '75101_0001_00001',
}) satisfies Prisma.LieuInclusionCreateInput

export const mediateque = givenLieuInclusion({
  id: '36929ed7-3b6f-4ed3-9924-b5e1a6c27096',
  nom: 'Exemple de Mediateque',
  adresse: '2 rue des livres',
  codePostal: '69002',
  codeInsee: '69382',
  commune: 'Lyon 2eme',
  banId: '69382_0001_00002',
  typologies: [Typologie.BIB, Typologie.MUNI, Typologie.CIDFF],
})

export const centreSocial = givenLieuInclusion({
  id: '36f20d7e-90ed-4932-911a-55320617ad56',
  nom: 'Exemple de Centre Social',
  adresse: '3 rue des amis',
  codePostal: '75003',
  commune: 'Paris 3eme',
  codeInsee: '75103',
  banId: '75103_0001_00003',
  typologies: [
    Typologie.PREVENTION,
    Typologie.REG,
    Typologie.CCAS,
    Typologie.CAARUD,
  ],
})

export const fixtureStructures = [structureEmployeuse, mediateque, centreSocial]

type StructureAdministrativeMainFixture = {
  structureCoopId: string
  create: Prisma.StructureAdministrativeMainCreateInput
}

const givenStructureAdministrativeMain = (
  structure: {
    id: string
    nom: string
    siret?: string | null
    adresse?: string
    commune?: string
    codePostal?: string
    codeInsee?: string
  },
  siret?: string,
): StructureAdministrativeMainFixture => ({
  structureCoopId: structure.id,
  create: {
    structureCoopId: structure.id,
    siret: siret ?? structure.siret ?? null,
    denominationSirene: structure.nom,
    denominationAntenne: structure.nom,
    // Adresse `main` : une employeuse sans commune n'est ni géocodable ni
    // choisissable à l'inscription. Les fixtures doivent donc en porter une,
    // comme en production.
    ...(structure.commune && structure.codePostal && structure.codeInsee
      ? {
          adresse: {
            connectOrCreate: {
              where: { codeBan: structure.id },
              create: {
                codeBan: structure.id,
                nomVoie: structure.adresse ?? null,
                codePostal: structure.codePostal,
                codeInsee: structure.codeInsee,
                nomCommune: structure.commune,
              },
            },
          },
        }
      : {}),
  },
})

// SIRET porté par la seule ligne `main` (le lieu fixture n'en a pas) : la recherche d'employeuse
// écarte les structures sans SIRET, puisqu'il identifie le choix. Sans lui, cette employeuse
// resterait introuvable dans le parcours d'inscription qui la cherche.
export const structureEmployeuseSiret = '13002526500013'

export const fixtureStructuresAdministrativesMain = [
  givenStructureAdministrativeMain(
    structureEmployeuse,
    structureEmployeuseSiret,
  ),
  givenStructureAdministrativeMain(mediateque),
]

export const seedStructures = async (transaction: Prisma.TransactionClient) => {
  // Les employeuses (structure_administrative) et les lieux (structures) sont
  // indépendants — pas de lien FK. Le double-rôle (structureEmployeuse, mediateque)
  // partage seulement l'id, comme la migration des données legacy.
  // SA main liées (ADR-002 périmètre élargi) : idempotent par id fixe. Le schéma `main` n'est pas
  // truncaté par deleteAll -> upsert.
  await enSerie(fixtureStructuresAdministrativesMain, (main) =>
    transaction.structureAdministrativeMain.upsert({
      where: { structureCoopId: main.structureCoopId },
      create: main.create,
      update: main.create,
      select: { id: true },
    }),
  )

  return enSerie(fixtureStructures, (structure) =>
    transaction.lieuInclusion.upsert({
      where: { id: structure.id },
      create: structure,
      update: structure,
      select: {
        id: true,
        nom: true,
      },
    }),
  )
}
