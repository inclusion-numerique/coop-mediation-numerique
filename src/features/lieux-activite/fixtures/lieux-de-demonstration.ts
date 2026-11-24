import { type Prisma, Typologie } from '@/generated/prisma/browser'
import { enSerie } from '@/libraries/fixtures/en-serie'
import { lieuInclusion } from './lieu-inclusion'

export const structureEmployeuse = lieuInclusion({
  id: 'f4dbca97-6fe8-4be1-97be-bdf5e66b9ea8',
  nom: 'Exemple de structure employeuse',
  adresse: '1 rue du vide',
  codePostal: '75001',
  codeInsee: '75101',
  commune: 'Paris 1er',
  banId: '75101_0001_00001',
}) satisfies Prisma.LieuInclusionCreateInput

export const mediateque = lieuInclusion({
  id: '36929ed7-3b6f-4ed3-9924-b5e1a6c27096',
  nom: 'Exemple de Mediateque',
  adresse: '2 rue des livres',
  codePostal: '69002',
  codeInsee: '69382',
  commune: 'Lyon 2eme',
  banId: '69382_0001_00002',
  typologies: [Typologie.BIB, Typologie.MUNI, Typologie.CIDFF],
})

export const centreSocial = lieuInclusion({
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

const lieuxDeDemonstration = [structureEmployeuse, mediateque, centreSocial]

export const semerLesLieuxDeDemonstration = (
  transaction: Prisma.TransactionClient,
) =>
  enSerie(lieuxDeDemonstration, (lieu) =>
    transaction.lieuInclusion.upsert({
      where: { id: lieu.id },
      create: lieu,
      update: lieu,
      select: { id: true, nom: true },
    }),
  )
