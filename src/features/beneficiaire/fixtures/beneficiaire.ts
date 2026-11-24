import { v4 } from 'uuid'
import type { Prisma } from '@/generated/prisma/client'

export const beneficiaire = <
  T extends Partial<Prisma.BeneficiaireUncheckedCreateInput> & {
    prenom: string
    nom: string
    mediateurId: string
  },
>(
  data: T,
) => {
  const { id, ...rest } = data

  const givenId = id ?? v4()

  const defauts = {
    anonyme: data.anonyme ?? false,
    attributionsAleatoires: data.attributionsAleatoires ?? false,
    telephone: data.telephone ?? null,
    pasDeTelephone: data.pasDeTelephone ?? null,
    email: data.email ?? null,
    anneeNaissance: data.anneeNaissance ?? null,
    adresse: data.adresse ?? null,
    commune: data.commune ?? null,
    communeCodePostal: data.communeCodePostal ?? null,
    communeCodeInsee: data.communeCodeInsee ?? null,
    genre: data.genre ?? null,
    trancheAge: data.trancheAge ?? null,
    statutSocial: data.statutSocial ?? null,
    notes: data.notes ?? null,
    ...(data.creation === undefined ? {} : { creation: data.creation }),
    ...(data.modification === undefined
      ? {}
      : { modification: data.modification }),
    suppression: data.suppression ?? null,
    ...(data.accompagnements === undefined
      ? {}
      : { accompagnements: data.accompagnements }),
  } satisfies Partial<Prisma.BeneficiaireUncheckedCreateInput>

  return { id: givenId, ...rest, ...defauts }
}

export const beneficiaireAnonyme = <
  T extends Partial<Prisma.BeneficiaireUncheckedCreateInput> & {
    prenom?: null
    nom?: null
    mediateurId: string
  },
>(
  data: T,
) => {
  const { id, ...rest } = data

  const givenId = id ?? v4()

  const defauts = {
    anonyme: true,
    attributionsAleatoires: data.attributionsAleatoires ?? false,
    telephone: data.telephone ?? null,
    pasDeTelephone: data.pasDeTelephone ?? null,
    email: data.email ?? null,
    anneeNaissance: data.anneeNaissance ?? null,
    adresse: data.adresse ?? null,
    commune: data.commune ?? null,
    communeCodePostal: data.communeCodePostal ?? null,
    communeCodeInsee: data.communeCodeInsee ?? null,
    genre: data.genre ?? null,
    trancheAge: data.trancheAge ?? null,
    statutSocial: data.statutSocial ?? null,
    notes: data.notes ?? null,
    ...(data.creation === undefined ? {} : { creation: data.creation }),
    ...(data.modification === undefined
      ? {}
      : { modification: data.modification }),
    suppression: data.suppression ?? null,
    ...(data.accompagnements === undefined
      ? {}
      : { accompagnements: data.accompagnements }),
  } satisfies Partial<Prisma.BeneficiaireUncheckedCreateInput>

  return { id: givenId, ...rest, ...defauts }
}
