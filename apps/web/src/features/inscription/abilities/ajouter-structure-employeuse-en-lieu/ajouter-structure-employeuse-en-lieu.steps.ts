import assert from 'node:assert'
import { StructureId } from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu'
import { ajouterStructureEmployeuseEnLieu } from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/commands/ajouter-structure-employeuse-en-lieu'
import {
  currentInscriptionUserId,
  seedStructureEmployeuse,
} from '@app/web/features/inscription/inscription.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

let structureEmployeuseId = ''

Given('je suis médiateur', async () => {
  await prismaClient.mediateur.create({
    data: { id: v4(), userId: currentInscriptionUserId() },
  })
})

Given('j’ai une structure employeuse', async () => {
  structureEmployeuseId = await seedStructureEmployeuse({
    nom: 'Structure employeuse de test',
  })
})

Given(
  'ma structure employeuse est déjà rattachée comme lieu d’activité',
  async () => {
    await ajouterStructureEmployeuseEnLieu({
      userId: currentInscriptionUserId(),
      structureEmployeuseId: StructureId(structureEmployeuseId),
      estLieuActivite: true,
    })
  },
)

When(
  'je déclare que ma structure employeuse est un lieu d’activité',
  async () => {
    await ajouterStructureEmployeuseEnLieu({
      userId: currentInscriptionUserId(),
      structureEmployeuseId: StructureId(structureEmployeuseId),
      estLieuActivite: true,
    })
  },
)

When(
  'je déclare que ma structure employeuse n’est pas un lieu d’activité',
  async () => {
    await ajouterStructureEmployeuseEnLieu({
      userId: currentInscriptionUserId(),
      structureEmployeuseId: StructureId(structureEmployeuseId),
      estLieuActivite: false,
    })
  },
)

const activeMediateurEnActivite = () =>
  prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: currentInscriptionUserId() },
      structureId: structureEmployeuseId,
      suppression: null,
      fin: null,
    },
  })

Then(
  'ma structure employeuse est rattachée comme lieu d’activité',
  async () => {
    const actives = await activeMediateurEnActivite()
    assert.strictEqual(
      actives.length,
      1,
      'La structure employeuse n’est pas rattachée comme lieu d’activité',
    )

    const lieu = await prismaClient.lieuInclusion.findUnique({
      where: { id: structureEmployeuseId },
    })
    assert.ok(lieu, 'Le lieu d’activité n’a pas été matérialisé')
  },
)

Then(
  'ma structure employeuse n’a qu’un seul lieu d’activité actif',
  async () => {
    const actives = await activeMediateurEnActivite()
    assert.strictEqual(actives.length, 1, 'Le lieu d’activité a été dupliqué')
  },
)

Then(
  'ma structure employeuse n’est plus rattachée comme lieu d’activité',
  async () => {
    const actives = await activeMediateurEnActivite()
    assert.strictEqual(
      actives.length,
      0,
      'La structure employeuse est encore rattachée comme lieu d’activité',
    )
  },
)
