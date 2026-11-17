import assert from 'node:assert'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { activerLaMediationNumerique } from './commands/activer-la-mediation-numerique'

const activation: {
  utilisateurId?: string
  resultat?: Awaited<ReturnType<typeof activerLaMediationNumerique>>
} = {}

const utilisateurId = (): string => {
  assert.ok(activation.utilisateurId, 'Aucun compte semé')
  return activation.utilisateurId
}

const semer = async (mediateur: boolean, coordinateur: boolean) => {
  activation.utilisateurId = await semerUnCompteDeListe({
    prenom: 'Coline',
    marqueur: `Mediation${v4().slice(0, 8)}`,
    creeLe: new Date('2026-01-01'),
    inscritLe: null,
    mediateur: mediateur
      ? { derniereActivite: null, dernierBeneficiaire: null }
      : null,
    coordinateur: coordinateur
      ? { aUneEquipe: false, aCoordonne: false }
      : null,
  })
}

Given('un coordinateur sans médiation numérique', async () => {
  await semer(false, true)
})

Given('un coordinateur qui a déjà activé la médiation numérique', async () => {
  await semer(true, true)
})

Given('un médiateur sans rôle coordinateur', async () => {
  await semer(true, false)
})

When('il active la médiation numérique', async () => {
  activation.resultat = await activerLaMediationNumerique(utilisateurId())
})

Then("l'activation de la médiation aboutit", () => {
  assert.ok(activation.resultat?.success, "L'activation a échoué")
})

Then(
  "l'activation de la médiation échoue avec l'erreur {string}",
  (attendu: string) => {
    const { resultat } = activation
    assert.ok(resultat && !resultat.success, "L'activation a abouti")
    assert.strictEqual(resultat.error._tag, attendu)
  },
)

Then(/^son compte porte (?:le|un seul) rôle médiateur$/, async () => {
  assert.strictEqual(
    await prismaClient.mediateur.count({ where: { userId: utilisateurId() } }),
    1,
  )
})
