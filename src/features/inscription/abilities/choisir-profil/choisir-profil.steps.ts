import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { choisirProfil } from '@/features/inscription/abilities/choisir-profil/domain/choisir-profil'
import { type ChoisirProfilError } from '@/features/inscription/abilities/choisir-profil/domain/decider-le-role'
import { enregistrerProfilChoisi } from '@/features/inscription/abilities/choisir-profil/implementations/prisma/enregistrer-profil-choisi.mutation'
import {
  type EtapeDInscription,
  ProfilInscription,
  Role,
} from '@/features/inscription/domain'
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

let resultat: Result<
  { readonly role: Role; readonly etapeSuivante: EtapeDInscription },
  ChoisirProfilError
>

Given(
  'mon inscription est déjà validée avec le profil {string}',
  async (profil: string) => {
    await seedInscriptionValidee(ProfilInscription.schema.parse(profil))
  },
)

When('je choisis le profil {string}', async (role: string) => {
  resultat = await choisirProfilAvec(async () => undefined)(
    {
      userId: utilisateurDeLInscriptionEnCours(),
      role: Role.schema.parse(role),
    },
    new Date(),
  )
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
  assert.ok(!resultat.success, 'Le choix du profil aurait dû être refusé')
  assert.strictEqual(resultat.error._tag, 'InscriptionDejaValidee')
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
