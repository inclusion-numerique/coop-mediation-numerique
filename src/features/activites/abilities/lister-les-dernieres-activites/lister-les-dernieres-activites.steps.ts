import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { listerLesDernieresActivites } from '@/features/activites/abilities/lister-les-dernieres-activites/implementations/prisma/dernieres-activites.query'
import { MediateurId } from '@/features/activites/domain/index'

const etat: {
  mediateurs: readonly { userId: string; mediateurId: string }[]
  notes: readonly string[]
} = {
  mediateurs: [],
  notes: [],
}

const semerUnMediateur = async () => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `dernieres-activites-${userId}@example.com` },
  })
  const { id: mediateurId } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  etat.mediateurs = [...etat.mediateurs, { userId, mediateurId }]
  return mediateurId
}

const mediateurConsulte = () => {
  const [premier] = etat.mediateurs
  if (!premier) throw new Error('Aucun médiateur semé')
  return premier.mediateurId
}

const semerUneActivite = (mediateurId: string, rang: number) =>
  prismaClient.activite.create({
    data: {
      mediateurId,
      type: 'Individuel',
      typeLieu: 'ADistance',
      date: new Date(`2026-06-0${rang}`),
      duree: 60,
      thematiques: ['Email'],
      accompagnements: {
        create: {
          beneficiaire: { create: { mediateurId, anonyme: true } },
        },
      },
      notes: `${rang}`,
      creation: new Date(`2026-07-0${rang}T10:00:00Z`),
    },
    select: { id: true },
  })

Given(
  'un médiateur ayant enregistré {int} activités',
  async (nombre: number) => {
    const mediateurId = await semerUnMediateur()
    await Promise.all(
      Array.from({ length: nombre }, (_, index) =>
        semerUneActivite(mediateurId, nombre - index),
      ),
    )
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
  await semerUneActivite(await semerUnMediateur(), 9)
})

When('je liste ses dernières activités', async () => {
  etat.notes = (
    await listerLesDernieresActivites({
      mediateurId: MediateurId(mediateurConsulte()),
      rendezVousLies: () => Promise.resolve([]),
    })
  ).map(({ activite }) => activite.notes ?? '')
})

Then('les activités listées sont {string}', (attendues: string) => {
  assert.strictEqual(etat.notes.join(', '), attendues)
})

After(async () => {
  const semes = etat.mediateurs
  etat.mediateurs = []
  etat.notes = []
  if (semes.length === 0) return

  const mediateurIds = semes.map(({ mediateurId }) => mediateurId)
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: semes.map(({ userId }) => userId) } },
  })
})
