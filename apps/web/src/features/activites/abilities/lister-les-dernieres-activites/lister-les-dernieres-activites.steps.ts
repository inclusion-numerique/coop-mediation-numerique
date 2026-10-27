import assert from 'node:assert'
import {
  listerLesDernieresActivites,
  MediateurId,
} from '@app/web/features/activites/abilities/lister-les-dernieres-activites'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

let mediateurs: readonly { userId: string; mediateurId: string }[] = []
let notes: readonly string[] = []

const semerUnMediateur = async () => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `dernieres-activites-${userId}@example.com` },
  })
  const { id: mediateurId } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  mediateurs = [...mediateurs, { userId, mediateurId }]
  return mediateurId
}

const mediateurConsulte = () => {
  const [premier] = mediateurs
  if (!premier) throw new Error('Aucun médiateur semé')
  return premier.mediateurId
}

const activite = (mediateurId: string, rang: number) => ({
  mediateurId,
  type: 'Individuel' as const,
  typeLieu: 'Autre' as const,
  date: new Date(`2026-06-0${rang}`),
  duree: 60,
  accompagnementsCount: 0,
  notes: `${rang}`,
  creation: new Date(`2026-07-0${rang}T10:00:00Z`),
})

Given(
  'un médiateur ayant enregistré {int} activités',
  async (nombre: number) => {
    const mediateurId = await semerUnMediateur()
    await prismaClient.activite.createMany({
      data: Array.from({ length: nombre }, (_, index) =>
        activite(mediateurId, nombre - index),
      ),
    })
  },
)

Given('sa dernière activité est supprimée', async () => {
  const derniere = await prismaClient.activite.findFirstOrThrow({
    where: { mediateurId: mediateurConsulte() },
    orderBy: { creation: 'desc' },
  })
  await prismaClient.activite.update({
    where: { id: derniere.id },
    data: { suppression: new Date() },
  })
})

Given("un autre médiateur vient d'enregistrer une activité", async () => {
  await prismaClient.activite.create({
    data: activite(await semerUnMediateur(), 9),
  })
})

When('je liste ses dernières activités', async () => {
  notes = (
    await listerLesDernieresActivites({
      mediateurId: MediateurId(mediateurConsulte()),
      timezone: 'Europe/Paris',
    })
  ).map((activite) => activite.notes ?? '')
})

Then('les activités listées sont {string}', (attendues: string) => {
  assert.strictEqual(notes.join(', '), attendues)
})

After(async () => {
  const semes = mediateurs
  mediateurs = []
  notes = []
  if (semes.length === 0) return

  const mediateurIds = semes.map(({ mediateurId }) => mediateurId)
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: semes.map(({ userId }) => userId) } },
  })
})
