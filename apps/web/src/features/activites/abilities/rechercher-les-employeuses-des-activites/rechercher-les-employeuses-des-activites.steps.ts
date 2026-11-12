import assert from 'node:assert'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import {
  type EmployeuseDesActivites,
  EmployeuseId,
  MediateurId,
  rechercherLesEmployeusesDesActivites,
} from '.'

type Semis = {
  readonly userIds: readonly string[]
  readonly mediateurIds: readonly string[]
  readonly employeuses: Readonly<Record<string, number>>
}

let semis: Semis = { userIds: [], mediateurIds: [], employeuses: {} }
let trouvees: readonly EmployeuseDesActivites[] = []

const semerUnMediateur = async () => {
  const userId = v4()
  await prismaClient.user.create({
    data: {
      id: userId,
      email: `employeuses-des-activites-${userId}@example.com`,
    },
  })
  const { id: mediateurId } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  semis = {
    ...semis,
    userIds: [...semis.userIds, userId],
    mediateurIds: [...semis.mediateurIds, mediateurId],
  }
  return mediateurId
}

const semerUneEmployeuse = async (nom: string) => {
  const { id } = await prismaClient.structureAdministrativeMain.create({
    data: { denominationAntenne: nom },
    select: { id: true },
  })
  semis = { ...semis, employeuses: { ...semis.employeuses, [nom]: id } }
  return id
}

const semerUneActivite = async ({
  mediateurId,
  employeuse,
  suppression = null,
}: {
  mediateurId: string
  employeuse: string
  suppression?: Date | null
}) =>
  prismaClient.activite.create({
    data: {
      mediateurId,
      type: 'Individuel',
      typeLieu: 'ADistance',
      date: new Date('2026-03-03'),
      duree: 60,
      accompagnementsCount: 0,
      structureEmployeuseMainId: await semerUneEmployeuse(employeuse),
      suppression,
    },
    select: { id: true },
  })

const mediateurCourant = (): string => {
  const mediateurId = semis.mediateurIds[0]
  if (mediateurId === undefined) throw new Error('Aucun médiateur semé')
  return mediateurId
}

const rechercher = async (recherche: string, exclues: readonly string[]) => {
  trouvees = await rechercherLesEmployeusesDesActivites({
    perimetre: {
      mediateurs: [MediateurId(mediateurCourant())],
      coordinateurId: null,
    },
    recherche,
    exclues: exclues.map((nom) => EmployeuseId(semis.employeuses[nom] ?? 0)),
  })
}

Given(
  'le médiateur a des activités pour les employeuses {string}',
  async (employeuses: string) => {
    const mediateurId = await semerUnMediateur()
    await Promise.all(
      employeuses
        .split(', ')
        .map((employeuse) => semerUneActivite({ mediateurId, employeuse })),
    )
  },
)

Given(
  "une activité supprimée du médiateur était pour l'employeuse {string}",
  async (employeuse: string) => {
    await semerUneActivite({
      mediateurId: mediateurCourant(),
      employeuse,
      suppression: new Date(),
    })
  },
)

Given(
  "un autre médiateur a une activité pour l'employeuse {string}",
  async (employeuse: string) => {
    await semerUneActivite({
      mediateurId: await semerUnMediateur(),
      employeuse,
    })
  },
)

When(
  'je recherche {string} parmi les employeuses de mes activités',
  async (recherche: string) => {
    await rechercher(recherche, [])
  },
)

When(
  'je recherche {string} parmi les employeuses de mes activités en excluant {string}',
  async (recherche: string, exclue: string) => {
    await rechercher(recherche, [exclue])
  },
)

Then('les employeuses trouvées sont {string}', (attendues: string) => {
  assert.strictEqual(trouvees.map(({ nom }) => nom).join(', '), attendues)
})

After(async () => {
  const seme = semis
  semis = { userIds: [], mediateurIds: [], employeuses: {} }
  trouvees = []
  if (seme.mediateurIds.length === 0) return
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: [...seme.mediateurIds] } },
  })
  await prismaClient.structureAdministrativeMain.deleteMany({
    where: { id: { in: Object.values(seme.employeuses) } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: [...seme.mediateurIds] } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...seme.userIds] } },
  })
})
