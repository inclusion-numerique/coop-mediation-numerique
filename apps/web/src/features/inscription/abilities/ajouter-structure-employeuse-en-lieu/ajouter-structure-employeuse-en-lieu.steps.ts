import assert from 'node:assert'
import { ajouterStructureEmployeuseEnLieu } from '@app/web/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/commands/ajouter-structure-employeuse-en-lieu'
import type { UserId } from '@app/web/features/inscription/domain'
import {
  currentInscriptionUserId,
  rattacherAEmployeuseMain,
  seedCollegueMediateur,
  seedEmployeuseMain,
  seedLieuActivite,
} from '@app/web/features/inscription/inscription.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Before, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const nomEmployeuse = 'Employeuse lieu d’activité'

let structureEmployeuseId = 0
let collegueUserId: UserId | null = null
let lieuConnuId = ''
let nomCommuneEmployeuse = ''

// État de module : sans remise à zéro, un collègue d'un scénario précédent
// ferait passer une assertion du suivant.
Before(() => {
  collegueUserId = null
})

const declarerPour = (userId: UserId) => async (estLieuActivite: boolean) => {
  const resultat = await ajouterStructureEmployeuseEnLieu({
    userId,
    estLieuActivite,
  })
  assert.ok(resultat.success, 'La déclaration aurait dû aboutir')
}

const declarer = (estLieuActivite: boolean) =>
  declarerPour(currentInscriptionUserId())(estLieuActivite)

Given('je suis médiateur', async () => {
  await prismaClient.mediateur.create({
    data: { id: v4(), userId: currentInscriptionUserId() },
  })
})

Given('j’ai une structure employeuse', async () => {
  structureEmployeuseId = await seedEmployeuseMain({ nom: nomEmployeuse })
  await rattacherAEmployeuseMain({
    userId: currentInscriptionUserId(),
    structureAdministrativeId: structureEmployeuseId,
  })
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

Given('j’ai une structure employeuse dénommée comme une mairie', async () => {
  // « Mairie de X » et « COMMUNE DE X » se normalisent tous deux en « ville X ».
  const commune = v4()
  structureEmployeuseId = await seedEmployeuseMain({
    nom: `Mairie de ${commune}`,
  })
  await rattacherAEmployeuseMain({
    userId: currentInscriptionUserId(),
    structureAdministrativeId: structureEmployeuseId,
  })
  lieuConnuId = ''
  collegueUserId = null
  // Mémorisé pour le Given suivant, qui pose le lieu coop homologue.
  nomCommuneEmployeuse = commune
})

Given(
  'la coop connaît déjà ce lieu sous la dénomination de la commune',
  async () => {
    // Même adresse que `seedEmployeuseMain` (1 rue de la Paix, Paris 75001).
    lieuConnuId = await seedLieuActivite({
      nom: `COMMUNE DE ${nomCommuneEmployeuse}`,
      // Une commune se déclare comme telle : l'employeuse « Mairie de X » n'a pas
      // de typologie et la sienne se déduit du nom, MUNI de part et d'autre.
      typologies: ['MUNI'],
    })
  },
)

Then('je suis rattaché au lieu que la coop connaissait déjà', async () => {
  const actifs = await prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: currentInscriptionUserId() },
      suppression: null,
      fin: null,
    },
    select: { structureId: true },
  })
  assert.deepStrictEqual(
    actifs.map(({ structureId }) => structureId),
    [lieuConnuId],
    'Le médiateur n’est pas rattaché au lieu que la coop connaissait',
  )
})

Then('ce lieu n’a pas été recréé', async () => {
  const lieux = await prismaClient.lieuInclusion.count({
    where: {
      suppression: null,
      OR: [
        { nom: `COMMUNE DE ${nomCommuneEmployeuse}` },
        { nom: `Mairie de ${nomCommuneEmployeuse}` },
      ],
    },
  })
  assert.strictEqual(lieux, 1, 'Le lieu a été matérialisé une seconde fois')
})

Given('un collègue partage ma structure employeuse', async () => {
  collegueUserId = await seedCollegueMediateur()
  await rattacherAEmployeuseMain({
    userId: collegueUserId,
    structureAdministrativeId: structureEmployeuseId,
  })
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
