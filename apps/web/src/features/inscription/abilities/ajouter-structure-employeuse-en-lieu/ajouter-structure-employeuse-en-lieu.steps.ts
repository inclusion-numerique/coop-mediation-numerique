import assert from 'node:assert'
import { EmployeuseId } from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu'
import { ajouterStructureEmployeuseEnLieu } from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/commands/ajouter-structure-employeuse-en-lieu'
import type { UserId } from '@app/web/features/inscription/domain'
import {
  currentInscriptionUserId,
  seedCollegueMediateur,
  seedEmployeuseMain,
} from '@app/web/features/inscription/inscription.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Before, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const nomEmployeuse = 'Employeuse lieu d’activité'

let structureEmployeuseId = 0
let collegueUserId: UserId | null = null

// État de module : sans remise à zéro, un collègue d'un scénario précédent
// ferait passer une assertion du suivant.
Before(() => {
  collegueUserId = null
})

const declarerPour = (userId: UserId) => (estLieuActivite: boolean) =>
  ajouterStructureEmployeuseEnLieu({
    userId,
    structureEmployeuseId: EmployeuseId(structureEmployeuseId),
    estLieuActivite,
  })

const declarer = (estLieuActivite: boolean) =>
  declarerPour(currentInscriptionUserId())(estLieuActivite)

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

Given('un collègue partage ma structure employeuse', async () => {
  collegueUserId = await seedCollegueMediateur()
})

When(
  'mon collègue déclare que notre structure employeuse est un lieu d’activité',
  async () => {
    assert.ok(collegueUserId, 'Aucun collègue n’a été créé pour ce scénario')
    await declarerPour(collegueUserId)(true)
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

/**
 * Le lieu matérialisé depuis une employeuse est partagé : deux médiateurs de la
 * même structure s'y rattachent, ils ne s'en créent pas un chacun.
 */
Then('nous sommes rattachés au même lieu d’activité', async () => {
  assert.ok(collegueUserId, 'Aucun collègue n’a été créé pour ce scénario')

  const lieux = await prismaClient.lieuInclusion.count({
    where: { nom: nomEmployeuse, suppression: null },
  })
  assert.strictEqual(
    lieux,
    1,
    'Le lieu a été matérialisé une fois par médiateur',
  )

  const rattachements = await prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: {
        userId: { in: [currentInscriptionUserId(), collegueUserId] },
      },
      suppression: null,
      fin: null,
    },
    select: { structureId: true },
  })
  assert.strictEqual(
    rattachements.length,
    2,
    'Les deux médiateurs ne sont pas rattachés',
  )
  assert.strictEqual(
    new Set(rattachements.map(({ structureId }) => structureId)).size,
    1,
    'Les deux médiateurs ne partagent pas le même lieu d’activité',
  )
})
