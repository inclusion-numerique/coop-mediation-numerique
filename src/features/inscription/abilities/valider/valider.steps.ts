import assert from 'node:assert'
import { type ValiderInscriptionError } from '@app/web/features/inscription/abilities/valider'
import { validerInscription } from '@app/web/features/inscription/abilities/valider/commands/valider'
import { ProfilInscription } from '@app/web/features/inscription/domain'
import {
  currentInscriptionUserId,
  seedProfilChoisi,
} from '@app/web/features/inscription/inscription.cucumber'
import type { Result } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

let resultat: Result<void, ValiderInscriptionError>

Given('mon profil d’inscription est {string}', async (profil: string) => {
  await seedProfilChoisi(ProfilInscription.schema.parse(profil))
})

Given('un compte médiateur existe pour mon inscription', async () => {
  await prismaClient.mediateur.create({
    data: { id: v4(), userId: currentInscriptionUserId() },
  })
})

Given('un compte coordinateur existe pour mon inscription', async () => {
  await prismaClient.coordinateur.create({
    data: { id: v4(), userId: currentInscriptionUserId() },
  })
})

Given('je n’ai pas encore accepté les CGU', async () => {
  await prismaClient.user.update({
    where: { id: currentInscriptionUserId() },
    data: { acceptationCgu: null },
  })
})

Given('mon inscription est déjà validée', async () => {
  await prismaClient.user.update({
    where: { id: currentInscriptionUserId() },
    data: { inscriptionValidee: new Date() },
  })
})

When('je valide mon inscription', async () => {
  resultat = await validerInscription(currentInscriptionUserId(), new Date())
})

Then('mon inscription est validée', async () => {
  assert.ok(resultat.success, 'La validation aurait dû réussir')
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: currentInscriptionUserId() },
    select: { inscriptionValidee: true },
  })
  assert.ok(user.inscriptionValidee, 'La date de validation n’a pas été posée')
})

Then('mes CGU sont acceptées', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: currentInscriptionUserId() },
    select: { acceptationCgu: true },
  })
  assert.ok(user.acceptationCgu, 'Les CGU n’ont pas été acceptées')
})

Then('mon inscription n’est pas validée', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: currentInscriptionUserId() },
    select: { inscriptionValidee: true },
  })
  assert.strictEqual(user.inscriptionValidee, null)
})

Then('la validation est refusée car aucun compte de rôle n’existe', () => {
  assert.ok(!resultat.success, 'La validation aurait dû être refusée')
  assert.strictEqual(resultat.error._tag, 'CompteDeRoleIntrouvable')
})

Then('la validation est refusée car l’inscription est déjà validée', () => {
  assert.ok(!resultat.success, 'La validation aurait dû être refusée')
  assert.strictEqual(resultat.error._tag, 'InscriptionDejaValidee')
})
