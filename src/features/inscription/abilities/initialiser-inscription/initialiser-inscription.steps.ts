import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { initialiserInscription } from '@/features/inscription/abilities/initialiser-inscription/domain/initialiser-inscription'
import { lireEtatPourEtapeSuivante } from '@/features/inscription/abilities/initialiser-inscription/implementations/prisma/etat-pour-etape-suivante.query'
import {
  type DispositifPersonne,
  type EtapeDInscription,
  ProfilInscription,
} from '@/features/inscription/domain'
import {
  seedLieuActivite,
  utilisateurDeLInscriptionEnCours,
} from '@/features/inscription/inscription.cucumber'
import { success } from '@/libraries/result'

// Seuls les ports à effets (dispositif, SIRET) sont fakés ; la lecture d'état
// passe par l'adapteur Prisma RÉEL sur la base seedée (BDD hybride).
let dispositif: DispositifPersonne = {
  connue: false,
  estConseillerNumerique: false,
  estCoordinateur: false,
}
let etapeSuivante: EtapeDInscription | null = null

Given('le dispositif ne connaît pas l’utilisateur', () => {
  dispositif = {
    connue: false,
    estConseillerNumerique: false,
    estCoordinateur: false,
  }
})

Given('le dispositif connaît l’utilisateur comme conseiller numérique', () => {
  dispositif = {
    connue: true,
    estConseillerNumerique: true,
    estCoordinateur: false,
  }
})

Given('l’utilisateur n’a ni profil ni lieu d’activité', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurDeLInscriptionEnCours() },
    select: { profilInscription: true },
  })
  assert.strictEqual(user.profilInscription, null)
})

Given(
  'l’utilisateur a le profil {string} sans lieu d’activité',
  async (profil: string) => {
    await prismaClient.user.update({
      where: { id: utilisateurDeLInscriptionEnCours() },
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
    const structureId = await seedLieuActivite()
    await prismaClient.user.update({
      where: { id: utilisateurDeLInscriptionEnCours() },
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
  const initialisation = await initialiserInscription({
    lireLeDispositif: async () => dispositif,
    enregistrerLeProfil: async () => undefined,
    garantirLeRoleCoordinateur: async () =>
      success({ _tag: 'HorsDuDispositif' }),
    garantirLeMediateur: async () => undefined,
    lireLeSiretARattacher: async () => ({ siret: null, aUneEmployeuse: false }),
    rattacherDepuisSiret: async () => success(undefined),
    lireEtatPourEtapeSuivante,
  })({ userId: utilisateurDeLInscriptionEnCours() })
  etapeSuivante = initialisation.data.nextStep
})

Then(
  'l’étape suivante de l’initialisation est {string}',
  (expected: string) => {
    assert.strictEqual(etapeSuivante, expected)
  },
)
