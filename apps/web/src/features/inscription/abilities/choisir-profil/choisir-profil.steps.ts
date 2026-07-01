import assert from 'node:assert'
import { choisirProfil } from '@app/web/features/inscription/abilities/choisir-profil/implementation'
import { ProfilInscription } from '@app/web/features/inscription/domain'
import { currentInscriptionUserId } from '@app/web/features/inscription/inscription.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Then, When } from '@cucumber/cucumber'

When('je choisis le profil {string}', async (profil: string) => {
  await choisirProfil({
    userId: currentInscriptionUserId(),
    profil: ProfilInscription.schema.parse(profil),
  })
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
