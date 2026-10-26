import assert from 'node:assert'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { consulterLaMaintenance } from '@app/web/features/maintenance-mode/abilities/consulter-la-maintenance'
import { reglerLaMaintenance } from '@app/web/features/maintenance-mode/abilities/regler-la-maintenance'
import {
  type EtatDeMaintenance,
  MESSAGE_DE_MAINTENANCE_PAR_DEFAUT,
  MessageDeMaintenance,
  messageAffiche,
  type RoleDuCompte,
} from '@app/web/features/maintenance-mode/domain'
import type { ServerActionResult } from '@app/web/libraries/nextjs'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

const tentative: { resultat?: ServerActionResult<unknown> } = {}

const auteurId = v4()

const etat = async (): Promise<EtatDeMaintenance> => consulterLaMaintenance()

const roles: Readonly<Record<string, RoleDuCompte>> = {
  User: 'User',
  Support: 'Support',
  Admin: 'Admin',
}

const roleNomme = (nom: string): RoleDuCompte => {
  const role = roles[nom]
  if (role === undefined) throw new Error(`Rôle inconnu : ${nom}`)
  return role
}

After(async () => {
  tentative.resultat = undefined
  await prismaClient.maintenance.deleteMany({ where: { createdBy: auteurId } })
})

Given('aucune maintenance en cours', async () => {
  assert.strictEqual(
    (await etat())._tag,
    'Inactive',
    'Une maintenance est déjà en cours dans la base',
  )
})

Given(
  'une maintenance en cours avec le message {string}',
  async (message: string) => {
    await reglerLaMaintenance({
      demande: { _tag: 'Activer', message: MessageDeMaintenance(message) },
      auteurId,
    })
  },
)

When(
  "l'administration active la maintenance avec le message {string}",
  async (message: string) => {
    await reglerLaMaintenance({
      demande: { _tag: 'Activer', message: MessageDeMaintenance(message) },
      auteurId,
    })
  },
)

When("l'administration active la maintenance sans message", async () => {
  await reglerLaMaintenance({
    demande: { _tag: 'Activer', message: null },
    auteurId,
  })
})

When("l'administration désactive la maintenance", async () => {
  await reglerLaMaintenance({ demande: { _tag: 'Desactiver' }, auteurId })
})

When(
  'un compte de rôle {string} tente une modification',
  async (role: string) => {
    tentative.resultat = await withMaintenance()(
      { user: { role: roleNomme(role) } },
      undefined,
      async () => ({ success: true, data: undefined }),
    )
  },
)

Then(
  'la maintenance est active avec le message {string}',
  async (message: string) => {
    const courant = await etat()
    assert.strictEqual(courant._tag, 'Active')
    assert.strictEqual(messageAffiche(courant), message)
  },
)

Then('la maintenance est active avec le message par défaut', async () => {
  const courant = await etat()
  assert.strictEqual(courant._tag, 'Active')
  assert.strictEqual(messageAffiche(courant), MESSAGE_DE_MAINTENANCE_PAR_DEFAUT)
})

Then('la maintenance est inactive', async () => {
  assert.strictEqual((await etat())._tag, 'Inactive')
})

Then('une seule maintenance est en cours', async () => {
  assert.strictEqual(
    await prismaClient.maintenance.count({ where: { endedAt: null } }),
    1,
  )
})

Then("la dernière maintenance de l'historique est close", async () => {
  const derniere = await prismaClient.maintenance.findFirstOrThrow({
    where: { createdBy: auteurId },
    orderBy: { startedAt: 'desc' },
  })
  assert.notStrictEqual(derniere.endedAt, null)
})

Then(
  'la modification est refusée avec le message {string}',
  (message: string) => {
    assert.deepStrictEqual(tentative.resultat, {
      success: false,
      error: message,
    })
  },
)

Then('la modification passe', () => {
  assert.strictEqual(tentative.resultat?.success, true)
})
