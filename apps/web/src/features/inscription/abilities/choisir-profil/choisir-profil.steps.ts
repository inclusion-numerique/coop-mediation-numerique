import assert from 'node:assert'
import { type ChoisirProfilError } from '@app/web/features/inscription/abilities/choisir-profil'
import { choisirProfil } from '@app/web/features/inscription/abilities/choisir-profil/commands/choisir-profil'
import {
  type InscriptionStep,
  ProfilInscription,
  Role,
} from '@app/web/features/inscription/domain'
import {
  currentInscriptionUserId,
  seedInscriptionValidee,
} from '@app/web/features/inscription/inscription.cucumber'
import type { Result } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

let resultat: Result<
  { readonly role: Role; readonly etapeSuivante: InscriptionStep },
  ChoisirProfilError
>

Given(
  'mon inscription est déjà validée avec le profil {string}',
  async (profil: string) => {
    await seedInscriptionValidee(ProfilInscription.schema.parse(profil))
  },
)

When('je choisis le profil {string}', async (role: string) => {
  resultat = await choisirProfil(
    {
      userId: currentInscriptionUserId(),
      role: Role.schema.parse(role),
    },
    new Date(),
  )
})

Then(
  'le profil d’inscription de l’utilisateur est {string}',
  async (expected: string) => {
    const user = await prismaClient.user.findUniqueOrThrow({
      where: { id: currentInscriptionUserId() },
      select: { profilInscription: true, acceptationCgu: true },
    })
    assert.strictEqual(user.profilInscription, expected)
    assert.ok(user.acceptationCgu, 'Les CGU n’ont pas été acceptées')
  },
)

Then('le choix du profil est refusé car l’inscription est déjà validée', () => {
  assert.ok(!resultat.success, 'Le choix du profil aurait dû être refusé')
  assert.strictEqual(resultat.error._tag, 'InscriptionDejaValidee')
})

Then('un compte médiateur existe pour l’utilisateur', async () => {
  const mediateur = await prismaClient.mediateur.findUnique({
    where: { userId: currentInscriptionUserId() },
  })
  assert.ok(mediateur, 'Aucun compte médiateur créé')
})

Then('aucun compte médiateur n’existe pour l’utilisateur', async () => {
  const mediateur = await prismaClient.mediateur.findUnique({
    where: { userId: currentInscriptionUserId() },
  })
  assert.strictEqual(mediateur, null)
})

Then('un compte coordinateur existe pour l’utilisateur', async () => {
  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { userId: currentInscriptionUserId() },
  })
  assert.ok(coordinateur, 'Aucun compte coordinateur créé')
})

Then('aucun compte coordinateur n’existe pour l’utilisateur', async () => {
  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { userId: currentInscriptionUserId() },
  })
  assert.strictEqual(coordinateur, null)
})
