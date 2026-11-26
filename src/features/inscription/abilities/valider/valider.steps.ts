import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type { EchecDeValider } from '@/features/inscription/abilities/valider/domain/errors'
import type { AccepterLesInvitations } from '@/features/inscription/abilities/valider/domain/ports'
import { valider } from '@/features/inscription/abilities/valider/domain/valider'
import type { InscriptionValidee } from '@/features/inscription/abilities/valider/domain/valider-inscription'
import { enregistrerValidation } from '@/features/inscription/abilities/valider/implementations/prisma/enregistrer-validation.mutation'
import { lireFaitsInscription } from '@/features/inscription/abilities/valider/implementations/prisma/lire-faits-inscription.query'
import { ProfilInscription } from '@/features/inscription/domain'
import {
  seedProfilChoisi,
  utilisateurDeLInscriptionEnCours,
} from '@/features/inscription/inscription.cucumber'
import {
  EchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'

const validerAvec = (accepterLesInvitations: AccepterLesInvitations) =>
  valider({
    lireFaitsInscription,
    enregistrerValidation,
    inscrireALaListeDeDiffusion: async () => success(undefined),
    accepterLesInvitations,
    signaler: () => undefined,
  })

let resultat: Result<InscriptionValidee<undefined>, EchecDeValider>

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
  resultat = await validerAvec(async () => success(undefined))({
    userId: utilisateurDeLInscriptionEnCours(),
    maintenant: new Date(),
  })
})

When(
  'je valide mon inscription alors que mes invitations ne peuvent être acceptées',
  async () => {
    resultat = await validerAvec(async () =>
      failure(EchecTechnique('Adresse électronique invalide')),
    )({
      userId: utilisateurDeLInscriptionEnCours(),
      maintenant: new Date(),
    })
  },
)

Then('mon inscription est validée', async () => {
  assert.ok(resultat.success, 'La validation aurait dû réussir')
  const user = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurDeLInscriptionEnCours() },
    select: { inscriptionValidee: true },
  })
  assert.ok(user.inscriptionValidee, 'La date de validation n’a pas été posée')
})

Then('l’échec de l’acceptation de mes invitations est rapporté', () => {
  assert.ok(resultat.success, 'La validation aurait dû réussir')
  assert.strictEqual(
    resultat.data.acceptationDesInvitations._tag,
    'AcceptationEchouee',
  )
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
