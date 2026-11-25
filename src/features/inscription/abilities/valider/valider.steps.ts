import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type {
  EffetsApresValidation,
  InscrireALaListeDeDiffusion,
} from '@/features/inscription/abilities/valider/domain/ports'
import { valider } from '@/features/inscription/abilities/valider/domain/valider'
import { type ValiderInscriptionError } from '@/features/inscription/abilities/valider/domain/valider-inscription'
import { enregistrerValidation } from '@/features/inscription/abilities/valider/implementations/prisma/enregistrer-validation.mutation'
import { lireFaitsInscription } from '@/features/inscription/abilities/valider/implementations/prisma/lire-faits-inscription.query'
import { ProfilInscription } from '@/features/inscription/domain'
import {
  seedProfilChoisi,
  utilisateurDeLInscriptionEnCours,
} from '@/features/inscription/inscription.cucumber'
import type { Result } from '@/libraries/result'

const validerAvec = (
  inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion,
  effetsApresValidation: EffetsApresValidation,
) =>
  valider({
    lireFaitsInscription,
    enregistrerValidation,
    inscrireALaListeDeDiffusion,
    effetsApresValidation,
  })

let resultat: Result<void, ValiderInscriptionError>

Given('mon profil d’inscription est {string}', async (profil: string) => {
  await seedProfilChoisi(ProfilInscription.schema.parse(profil))
})

Given('un compte médiateur existe pour mon inscription', async () => {
  await prismaClient.mediateur.create({
    data: { id: v4(), userId: utilisateurDeLInscriptionEnCours() },
  })
})

Given('un compte coordinateur existe pour mon inscription', async () => {
  await prismaClient.coordinateur.create({
    data: { id: v4(), userId: utilisateurDeLInscriptionEnCours() },
  })
})

Given('je n’ai pas encore accepté les CGU', async () => {
  await prismaClient.user.update({
    where: { id: utilisateurDeLInscriptionEnCours() },
    data: { acceptationCgu: null },
  })
})

Given('mon inscription est déjà validée', async () => {
  await prismaClient.user.update({
    where: { id: utilisateurDeLInscriptionEnCours() },
    data: { inscriptionValidee: new Date() },
  })
})

When('je valide mon inscription', async () => {
  resultat = await validerAvec(
    async () => undefined,
    async () => undefined,
  )(utilisateurDeLInscriptionEnCours(), new Date())
})

Then('mon inscription est validée', async () => {
  assert.ok(resultat.success, 'La validation aurait dû réussir')
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurDeLInscriptionEnCours() },
    select: { inscriptionValidee: true },
  })
  assert.ok(user.inscriptionValidee, 'La date de validation n’a pas été posée')
})

Then('mes CGU sont acceptées', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurDeLInscriptionEnCours() },
    select: { acceptationCgu: true },
  })
  assert.ok(user.acceptationCgu, 'Les CGU n’ont pas été acceptées')
})

Then('mon inscription n’est pas validée', async () => {
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurDeLInscriptionEnCours() },
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
