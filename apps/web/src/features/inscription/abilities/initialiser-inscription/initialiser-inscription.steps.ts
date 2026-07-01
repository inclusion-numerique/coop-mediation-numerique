import assert from 'node:assert'
import {
  type DataspaceInscription,
  initialiserInscription,
} from '@app/web/features/inscription/abilities/initialiser-inscription/domain'
import { lireEtatPourEtapeSuivante } from '@app/web/features/inscription/abilities/initialiser-inscription/implementation/prisma/lire-etat-pour-etape-suivante'
import {
  Email,
  type InscriptionStep,
  ProfilInscription,
} from '@app/web/features/inscription/domain'
import {
  currentInscriptionUserId,
  seedStructure,
} from '@app/web/features/inscription/inscription.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

// Seuls les ports API-bound (Dataspace, SIRET) sont fakés ; la lecture d'état
// passe par l'adapteur Prisma RÉEL sur la base seedée (BDD hybride).
let dataspaceInscription: DataspaceInscription | null = null
let etapeSuivante: InscriptionStep | null = null

Given('le Dataspace ne connaît pas l’utilisateur', () => {
  dataspaceInscription = null
})

Given('le Dataspace renvoie un conseiller numérique', () => {
  dataspaceInscription = { isConseillerNumerique: true }
})

Given('l’utilisateur n’a ni profil ni lieu d’activité', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: currentInscriptionUserId() },
    select: { profilInscription: true },
  })
  assert.strictEqual(user.profilInscription, null)
})

Given(
  'l’utilisateur a le profil {string} sans lieu d’activité',
  async (profil: string) => {
    await prismaClient.user.update({
      where: { id: currentInscriptionUserId() },
      data: {
        profilInscription: ProfilInscription.schema.parse(profil),
        mediateur: { create: { id: v4() } },
      },
    })
  },
)

Given(
  'l’utilisateur a le profil {string} avec des lieux d’activité',
  async (profil: string) => {
    const structureId = await seedStructure()
    await prismaClient.user.update({
      where: { id: currentInscriptionUserId() },
      data: {
        profilInscription: ProfilInscription.schema.parse(profil),
        mediateur: {
          create: {
            id: v4(),
            enActivite: {
              create: { id: v4(), structureId, debut: new Date() },
            },
          },
        },
      },
    })
  },
)

When('j’initialise l’inscription', async () => {
  const { nextStep } = await initialiserInscription(
    {
      userId: currentInscriptionUserId(),
      email: Email('initialiser@test.local'),
    },
    {
      synchroniserDepuisDataspace: async () => dataspaceInscription,
      importerStructureDepuisSiret: async () => undefined,
      lireEtatPourEtapeSuivante,
    },
  )
  etapeSuivante = nextStep
})

Then(
  'l’étape suivante de l’initialisation est {string}',
  (expected: string) => {
    assert.strictEqual(etapeSuivante, expected)
  },
)
