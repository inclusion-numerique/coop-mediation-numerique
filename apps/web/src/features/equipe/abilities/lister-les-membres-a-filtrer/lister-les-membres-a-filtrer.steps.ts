import assert from 'node:assert'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { CoordinateurId } from '../../domain/coordinateur-id'
import { MediateurId } from '../../domain/mediateur-id'
import { listerLesMembresAFiltrer, type MembreAFiltrer } from '.'

type Seme = { userId: string; mediateurId: string; coordinateurId?: string }

let semes: Readonly<Record<string, Seme>> = {}
let coordinateur: string | undefined
let listes: readonly MembreAFiltrer[] = []

const semerUnMediateur = async (
  nom: string,
  avecCoordinateur: boolean,
): Promise<Seme> => {
  const userId = v4()
  const [firstName, lastName] = nom.split(' ')
  await prismaClient.user.create({
    data: {
      id: userId,
      email: `membres-a-filtrer-${userId}@example.com`,
      firstName,
      lastName,
    },
  })
  const { id: mediateurId } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  const coordinateurId = avecCoordinateur
    ? (
        await prismaClient.coordinateur.create({
          data: { userId },
          select: { id: true },
        })
      ).id
    : undefined
  const seme = { userId, mediateurId, coordinateurId }
  semes = { ...semes, [nom]: seme }
  return seme
}

const membre = async (nom: string): Promise<Seme> =>
  semes[nom] ?? semerUnMediateur(nom, false)

const coordinateurId = (): string => {
  const id = coordinateur ? semes[coordinateur]?.coordinateurId : undefined
  assert.ok(id, 'Aucun coordinateur semé')
  return id
}

Given('un coordinateur médiateur {string} à filtrer', async (nom: string) => {
  await semerUnMediateur(nom, true)
  coordinateur = nom
})

Given('{string} est membre de son équipe', async (nom: string) => {
  const { mediateurId } = await membre(nom)
  await prismaClient.mediateurCoordonne.create({
    data: { coordinateurId: coordinateurId(), mediateurId },
  })
})

Given('{string} a quitté son équipe', async (nom: string) => {
  const { mediateurId } = await membre(nom)
  await prismaClient.mediateurCoordonne.create({
    data: {
      coordinateurId: coordinateurId(),
      mediateurId,
      suppression: new Date('2026-03-06'),
    },
  })
})

When('je liste les membres à filtrer de {string}', async (nom: string) => {
  const demandeur = semes[nom]
  assert.ok(demandeur, `${nom} n'est pas semé`)
  listes = await listerLesMembresAFiltrer({
    coordinateurId: CoordinateurId(coordinateurId()),
    demandeur: MediateurId(demandeur.mediateurId),
    membres: Object.entries(semes)
      .filter(([cle]) => cle !== nom)
      .map(([, { mediateurId }]) => MediateurId(mediateurId)),
  })
})

Then('les membres à filtrer sont {string}', (attendus: string) => {
  assert.strictEqual(
    listes.map(({ nom, situation }) => `${nom} ${situation}`).join(', '),
    attendus,
  )
})

After(async () => {
  const tous = Object.values(semes)
  semes = {}
  coordinateur = undefined
  listes = []
  if (tous.length === 0) return
  const coordinateurIds = tous.flatMap(({ coordinateurId }) =>
    coordinateurId ? [coordinateurId] : [],
  )
  await prismaClient.mediateurCoordonne.deleteMany({
    where: { coordinateurId: { in: coordinateurIds } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: { in: coordinateurIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: tous.map(({ mediateurId }) => mediateurId) } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: tous.map(({ userId }) => userId) } },
  })
})
