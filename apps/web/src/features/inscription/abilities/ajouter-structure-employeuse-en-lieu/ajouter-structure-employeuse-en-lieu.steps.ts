import assert from 'node:assert'
import { EmployeuseId } from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu'
import { ajouterStructureEmployeuseEnLieu } from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/commands/ajouter-structure-employeuse-en-lieu'
import {
  currentInscriptionUserId,
  seedEmployeuseMain,
} from '@app/web/features/inscription/inscription.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const nomEmployeuse = 'Employeuse lieu d’activité'

let structureEmployeuseId = 0

const declarer = (estLieuActivite: boolean) =>
  ajouterStructureEmployeuseEnLieu({
    userId: currentInscriptionUserId(),
    structureEmployeuseId: EmployeuseId(structureEmployeuseId),
    estLieuActivite,
  })

Given('je suis médiateur', async () => {
  await prismaClient.mediateur.create({
    data: { id: v4(), userId: currentInscriptionUserId() },
  })
})

Given('j’ai une structure employeuse', async () => {
  structureEmployeuseId = await seedEmployeuseMain({ nom: nomEmployeuse })
})

Given(
  'ma structure employeuse est déjà rattachée comme lieu d’activité',
  async () => {
    await declarer(true)
  },
)

When(
  'je déclare que ma structure employeuse est un lieu d’activité',
  async () => {
    await declarer(true)
  },
)

When(
  'je déclare que ma structure employeuse n’est pas un lieu d’activité',
  async () => {
    await declarer(false)
  },
)

/**
 * Le lieu ne reprend pas l'id de l'employeuse : on le retrouve par la clé de
 * corrélation employée en production — ici sa seule dénomination suffit, le
 * scénario n'en manipulant qu'une.
 */
const rattachementsActifs = () =>
  prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: currentInscriptionUserId() },
      lieuInclusion: { nom: nomEmployeuse },
      suppression: null,
      fin: null,
    },
  })

Then(
  'ma structure employeuse est rattachée comme lieu d’activité',
  async () => {
    const actifs = await rattachementsActifs()
    assert.strictEqual(
      actifs.length,
      1,
      'La structure employeuse n’est pas rattachée comme lieu d’activité',
    )

    const lieu = await prismaClient.lieuInclusion.findFirst({
      where: { nom: nomEmployeuse, suppression: null },
    })
    assert.ok(lieu, 'Le lieu d’activité n’a pas été matérialisé')
  },
)

Then(
  'ma structure employeuse n’a qu’un seul lieu d’activité actif',
  async () => {
    const actifs = await rattachementsActifs()
    assert.strictEqual(actifs.length, 1, 'Le lieu d’activité a été dupliqué')

    const lieux = await prismaClient.lieuInclusion.count({
      where: { nom: nomEmployeuse, suppression: null },
    })
    assert.strictEqual(lieux, 1, 'Le lieu a été matérialisé deux fois')
  },
)

Then(
  'ma structure employeuse n’est plus rattachée comme lieu d’activité',
  async () => {
    const actifs = await rattachementsActifs()
    assert.strictEqual(
      actifs.length,
      0,
      'La structure employeuse est encore rattachée comme lieu d’activité',
    )
  },
)
