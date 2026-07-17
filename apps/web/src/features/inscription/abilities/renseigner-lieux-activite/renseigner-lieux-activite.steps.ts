import assert from 'node:assert'
import { renseignerLieuxActivite } from '@app/web/features/inscription/abilities/renseigner-lieux-activite/commands/renseigner-lieux-activite'
import { ProfilInscription } from '@app/web/features/inscription/domain'
import {
  currentInscriptionUserId,
  seedLieuActivite,
  seedProfilChoisi,
  trackLieuActivite,
} from '@app/web/features/inscription/inscription.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

let lieuDisponibleId = ''
let ancienLieuId = ''

const activitesActivesPour = (structureId: string) =>
  prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: currentInscriptionUserId() },
      structureId,
      suppression: null,
      fin: null,
    },
  })

Given('je suis un médiateur en cours d’inscription', async () => {
  await seedProfilChoisi(ProfilInscription.schema.parse('Mediateur'))
  await prismaClient.mediateur.create({
    data: { id: v4(), userId: currentInscriptionUserId() },
  })
})

Given('un lieu d’activité est disponible', async () => {
  lieuDisponibleId = await seedLieuActivite({ nom: 'Lieu disponible' })
})

Given('j’ai déjà un lieu d’activité rattaché', async () => {
  ancienLieuId = await seedLieuActivite({ nom: 'Ancien lieu' })
  await prismaClient.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateur: { connect: { userId: currentInscriptionUserId() } },
      lieuInclusion: { connect: { id: ancienLieuId } },
      debut: new Date(),
    },
  })
})

When('je renseigne ce lieu comme lieu d’activité', async () => {
  const resultat = await renseignerLieuxActivite({
    command: {
      userId: currentInscriptionUserId(),
      lieuxActivite: [
        {
          id: lieuDisponibleId,
          nom: 'Lieu disponible',
          adresse: '1 rue de la Paix',
          commune: 'Paris',
          codePostal: '75001',
        },
      ],
    },
    trouverStructuresCarto: async () => [],
    maintenant: new Date(),
  })
  assert.ok(resultat.success, 'Le renseignement des lieux aurait dû réussir')
})

When('je renseigne un nouveau lieu nommé {string}', async (nom: string) => {
  const resultat = await renseignerLieuxActivite({
    command: {
      userId: currentInscriptionUserId(),
      lieuxActivite: [
        {
          nom,
          adresse: '12 rue des Lilas',
          commune: 'Lyon',
          codePostal: '69000',
          codeInsee: '69123',
          latitude: 45.75,
          longitude: 4.85,
        },
      ],
    },
    trouverStructuresCarto: async () => [],
    maintenant: new Date(),
  })
  assert.ok(resultat.success, 'Le renseignement des lieux aurait dû réussir')
})

Then('l’étape lieux d’activité est franchie', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: currentInscriptionUserId() },
    select: { lieuxActiviteRenseignes: true },
  })
  assert.ok(
    user.lieuxActiviteRenseignes,
    'L’étape lieux d’activité n’est pas marquée franchie',
  )
})

Then('ce lieu est un de mes lieux d’activité actifs', async () => {
  const actives = await activitesActivesPour(lieuDisponibleId)
  assert.strictEqual(
    actives.length,
    1,
    'Le lieu n’est pas un lieu d’activité actif',
  )
})

Then('mon ancien lieu d’activité est retiré', async () => {
  const actives = await activitesActivesPour(ancienLieuId)
  assert.strictEqual(
    actives.length,
    0,
    'L’ancien lieu d’activité n’a pas été retiré',
  )
})

Then(
  'un lieu d’activité nommé {string} est créé et rattaché',
  async (nom: string) => {
    // Scopé à l'utilisateur courant (frais à chaque scénario) pour être robuste
    // aux éventuels lieux homonymes laissés par d'anciens runs.
    const actives = await prismaClient.mediateurEnActivite.findMany({
      where: {
        mediateur: { userId: currentInscriptionUserId() },
        suppression: null,
        fin: null,
      },
      select: { lieuInclusion: { select: { id: true, nom: true } } },
    })

    const rattache = actives.find(
      (activite) => activite.lieuInclusion.nom === nom,
    )
    assert.ok(rattache, 'Le nouveau lieu n’a pas été créé et rattaché')
    trackLieuActivite(rattache.lieuInclusion.id)
  },
)
