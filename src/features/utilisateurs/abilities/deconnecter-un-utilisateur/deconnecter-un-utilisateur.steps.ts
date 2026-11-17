import assert from 'node:assert'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { deconnecterUnUtilisateur } from './implementation'

const deconnexion: {
  utilisateurId?: string
  resultat?: Awaited<ReturnType<typeof deconnecterUnUtilisateur>>
} = {}

const utilisateurId = (): string => {
  assert.ok(deconnexion.utilisateurId, 'Aucun compte semé')
  return deconnexion.utilisateurId
}

Given(
  'un compte à déconnecter avec {int} sessions ouvertes',
  async (sessions: number) => {
    deconnexion.utilisateurId = await semerUnCompteDeListe({
      prenom: 'Sam',
      marqueur: `Deconnexion${v4().slice(0, 8)}`,
      creeLe: new Date('2026-01-01'),
      inscritLe: new Date('2026-01-02'),
    })
    await prismaClient.session.createMany({
      data: Array.from({ length: sessions }, () => ({
        sessionToken: v4(),
        userId: utilisateurId(),
        expires: new Date(Date.now() + 86_400_000),
      })),
    })
  },
)

When("l'administration déconnecte ce compte", async () => {
  deconnexion.resultat = await deconnecterUnUtilisateur(utilisateurId())
})

When("l'administration déconnecte un compte qui n'existe pas", async () => {
  deconnexion.resultat = await deconnecterUnUtilisateur(v4())
})

Then('{int} sessions sont fermées', (attendu: number) => {
  const { resultat } = deconnexion
  assert.ok(resultat?.success, 'La déconnexion a échoué')
  assert.strictEqual(resultat.data.sessionsFermees, attendu)
})

Then("ce compte n'a plus aucune session", async () => {
  assert.strictEqual(
    await prismaClient.session.count({ where: { userId: utilisateurId() } }),
    0,
  )
})

Then("la déconnexion échoue avec l'erreur {string}", (attendu: string) => {
  const { resultat } = deconnexion
  assert.ok(resultat && !resultat.success, 'La déconnexion a abouti')
  assert.strictEqual(resultat.error._tag, attendu)
})
