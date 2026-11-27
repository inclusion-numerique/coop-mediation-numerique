import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'

setDefaultTimeout(60_000)

const tracked = {
  contrats: new Set<number>(),
  affectations: new Set<number>(),
  personnes: new Set<number>(),
  employeuses: new Set<number>(),
  utilisateurs: new Set<string>(),
}

export const seedUtilisateur = async (): Promise<string> => {
  const { id } = await prismaClient.user.create({
    data: { email: `employeuse-${v4()}@test.local`, isFixture: true },
    select: { id: true },
  })
  tracked.utilisateurs.add(id)
  return id
}

export const seedEmployeuseMain = async (
  nom: string,
  siret?: string,
): Promise<number> => {
  const { id } = await prismaClient.structureAdministrativeMain.create({
    data: {
      denominationAntenne: nom,
      ...(siret === undefined ? {} : { siret }),
    },
    select: { id: true },
  })
  tracked.employeuses.add(id)
  return id
}

export const desactiverAffectations = async (
  employeuseId: number,
): Promise<void> => {
  await prismaClient.personneAffectationEmploiMain.updateMany({
    where: { structureAdministrativeId: employeuseId },
    data: { estActive: false },
  })
}

export const supprimerEmployeuseMain = async (
  employeuseId: number,
): Promise<void> => {
  await prismaClient.structureAdministrativeMain.update({
    where: { id: employeuseId },
    data: { deletedAt: new Date() },
  })
}

export const affectationsDe = async (
  userId: string,
): Promise<
  { structureAdministrativeId: number; source: string; estActive: boolean }[]
> =>
  prismaClient.personneAffectationEmploiMain.findMany({
    where: { personne: { coopId: userId } },
    select: {
      structureAdministrativeId: true,
      source: true,
      estActive: true,
    },
    orderBy: { id: 'asc' },
  })

const personneDe = async (userId: string): Promise<number> => {
  const existante = await prismaClient.personneMain.findUnique({
    where: { coopId: userId },
    select: { id: true },
  })
  if (existante) return existante.id

  const { id } = await prismaClient.personneMain.create({
    data: { coopId: userId },
    select: { id: true },
  })
  tracked.personnes.add(id)
  return id
}

export const seedAffectation = async ({
  userId,
  employeuseId,
  source,
  active = true,
  enregistreeLe,
}: {
  userId: string
  employeuseId: number
  source: string
  active?: boolean
  enregistreeLe?: Date
}): Promise<void> => {
  const personneId = await personneDe(userId)
  const { id } = await prismaClient.personneAffectationEmploiMain.create({
    data: {
      personneId,
      structureAdministrativeId: employeuseId,
      source,
      estActive: active,
      ...(enregistreeLe === undefined ? {} : { createdAt: enregistreeLe }),
    },
    select: { id: true },
  })
  tracked.affectations.add(id)
}

export const seedContrat = async ({
  userId,
  employeuseId,
  debut,
  fin,
}: {
  userId: string
  employeuseId: number
  debut: Date | null
  fin: Date | null
}): Promise<void> => {
  const personneId = await personneDe(userId)
  const { id } = await prismaClient.contratMain.create({
    data: {
      personneId,
      structureId: employeuseId,
      dateDebut: debut,
      dateFin: fin,
    },
    select: { id: true },
  })
  tracked.contrats.add(id)
}

const vider = <T>(ids: Set<T>): T[] => {
  const valeurs = [...ids]
  ids.clear()
  return valeurs
}

After(async () => {
  const utilisateurs = vider(tracked.utilisateurs)
  const dePersonneDeTest = { personne: { coopId: { in: utilisateurs } } }

  await prismaClient.contratMain.deleteMany({ where: dePersonneDeTest })
  await prismaClient.personneAffectationEmploiMain.deleteMany({
    where: dePersonneDeTest,
  })
  await prismaClient.personneMain.deleteMany({
    where: { coopId: { in: utilisateurs } },
  })
  await prismaClient.structureAdministrativeMain.deleteMany({
    where: { id: { in: vider(tracked.employeuses) } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: utilisateurs } } })

  tracked.contrats.clear()
  tracked.affectations.clear()
  tracked.personnes.clear()
})
