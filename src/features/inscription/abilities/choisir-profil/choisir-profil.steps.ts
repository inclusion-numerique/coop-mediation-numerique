import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { choisirProfil } from '@/features/inscription/abilities/choisir-profil/domain/choisir-profil'
import type { EchecDeChoisirProfil } from '@/features/inscription/abilities/choisir-profil/domain/errors'
import type { ProfilChoisi } from '@/features/inscription/abilities/choisir-profil/domain/profil-choisi'
import { enregistrerProfilChoisi } from '@/features/inscription/abilities/choisir-profil/implementations/prisma/enregistrer-profil-choisi.mutation'
import { ProfilInscription, Role } from '@/features/inscription/domain'
import { getInscriptionEtat } from '@/features/inscription/implementations/prisma/get-inscription-etat.query'
import type { SynchroniserLaPersonne } from '@/features/inscription/implementations/prisma/synchroniser-la-personne.mutation'
import {
  seedInscriptionValidee,
  utilisateurDeLInscriptionEnCours,
} from '@/features/inscription/inscription.cucumber'
import type { Result } from '@/libraries/result'

const choisirProfilAvec = (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  choisirProfil({
    lireLEtat: getInscriptionEtat,
    enregistrerProfilChoisi: enregistrerProfilChoisi(synchroniserLaPersonne),
  })

const contexte: {
  resultat: Result<ProfilChoisi, EchecDeChoisirProfil> | null
} = { resultat: null }

Given(
  'mon inscription est déjà validée avec le profil {string}',
  async (profil: string) => {
    await seedInscriptionValidee(ProfilInscription.schema.parse(profil))
  },
)

When('je choisis le profil {string}', async (role: string) => {
  contexte.resultat = await choisirProfilAvec(async () => undefined)({
    userId: utilisateurDeLInscriptionEnCours(),
    role: Role.schema.parse(role),
    maintenant: new Date(),
  })
})

Then(
  'le profil d’inscription de l’utilisateur est {string}',
  async (expected: string) => {
    const user = await prismaClient.user.findUniqueOrThrow({
      where: { id: utilisateurDeLInscriptionEnCours() },
      select: { profilInscription: true, acceptationCgu: true },
    })
    assert.strictEqual(user.profilInscription, expected)
    assert.ok(user.acceptationCgu, 'Les CGU n’ont pas été acceptées')
  },
)

Then('le choix du profil est refusé car l’inscription est déjà validée', () => {
  assert.ok(
    contexte.resultat && !contexte.resultat.success,
    'Le choix du profil aurait dû être refusé',
  )
  assert.strictEqual(contexte.resultat.error._tag, 'InscriptionDejaValidee')
})

Then('un compte médiateur existe pour l’utilisateur', async () => {
  const mediateur = await prismaClient.mediateur.findUnique({
    where: { userId: utilisateurDeLInscriptionEnCours() },
  })
  assert.ok(mediateur, 'Aucun compte médiateur créé')
})

Then('aucun compte médiateur n’existe pour l’utilisateur', async () => {
  const mediateur = await prismaClient.mediateur.findUnique({
    where: { userId: utilisateurDeLInscriptionEnCours() },
  })
  assert.strictEqual(mediateur, null)
})

Then('un compte coordinateur existe pour l’utilisateur', async () => {
  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { userId: utilisateurDeLInscriptionEnCours() },
  })
  assert.ok(coordinateur, 'Aucun compte coordinateur créé')
})

Then('aucun compte coordinateur n’existe pour l’utilisateur', async () => {
  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { userId: utilisateurDeLInscriptionEnCours() },
  })
  assert.strictEqual(coordinateur, null)
})
