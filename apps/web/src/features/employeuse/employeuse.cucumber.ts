import { prismaClient } from '@app/web/prismaClient'
import { After, setDefaultTimeout } from '@cucumber/cucumber'
import { v4 } from 'uuid'

setDefaultTimeout(60_000)

/**
 * Support Cucumber de la feature employeuse.
 *
 * Les scénarios construisent leur propre état dans `main` (employeuse, personne,
 * affectation, contrat) plutôt que de s'appuyer sur les fixtures partagées : une
 * personne de fixture porte déjà des affectations, ce qui rendrait indécidables
 * les scénarios « aucune employeuse » et « une seule affectation active ».
 */
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

export const seedEmployeuseMain = async (nom: string): Promise<number> => {
  const { id } = await prismaClient.structureAdministrativeMain.create({
    data: { denominationAntenne: nom },
    select: { id: true },
  })
  tracked.employeuses.add(id)
  return id
}

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
}: {
  userId: string
  employeuseId: number
  source: string
  active?: boolean
}): Promise<void> => {
  const personneId = await personneDe(userId)
  const { id } = await prismaClient.personneAffectationEmploiMain.create({
    data: {
      personneId,
      structureAdministrativeId: employeuseId,
      source,
      estActive: active,
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

// Ordre imposé par les clés étrangères : contrats et affectations d'abord, la
// personne ensuite, puis l'employeuse, l'utilisateur en dernier (la personne
// référence `coop.users`).
After(async () => {
  await prismaClient.contratMain.deleteMany({
    where: { id: { in: vider(tracked.contrats) } },
  })
  await prismaClient.personneAffectationEmploiMain.deleteMany({
    where: { id: { in: vider(tracked.affectations) } },
  })
  await prismaClient.personneMain.deleteMany({
    where: { id: { in: vider(tracked.personnes) } },
  })
  await prismaClient.structureAdministrativeMain.deleteMany({
    where: { id: { in: vider(tracked.employeuses) } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: vider(tracked.utilisateurs) } },
  })
})
