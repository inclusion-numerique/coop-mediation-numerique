import assert from 'node:assert'
import type { DeconnecterCompteRdv } from '@app/web/features/rdvsp/abilities/deconnecter-compte-rdv/domain/deconnecter-compte-rdv'
import { deconnecterCompteRdv } from '@app/web/features/rdvsp/abilities/deconnecter-compte-rdv/implementation/prisma/deconnecter-compte-rdv.mutation'
import {
  compteRdvEnBase,
  ID_TEST,
  seedCompteRdv,
  testUtilisateurId,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

const AGENT_ID = ID_TEST.compte + 2
const MAINTENANT = new Date('2026-08-17T16:00:00.000Z')

let resultat: Awaited<ReturnType<DeconnecterCompteRdv>> | undefined

const deconnecter = deconnecterCompteRdv(() => MAINTENANT)

Given('un compte RDV lié à déconnecter', async () => {
  await seedCompteRdv({
    id: AGENT_ID,
    accessToken: 'jeton-acces',
    refreshToken: 'jeton-rafraichissement',
    expiresAt: new Date('2026-08-17T18:00:00.000Z'),
    scope: 'write',
  })
})

Given(
  'un compte RDV à déconnecter synchronisé depuis le {string}',
  async (jour: string) => {
    await seedCompteRdv({
      id: AGENT_ID,
      accessToken: 'jeton-acces',
      syncFrom: new Date(`${jour}T00:00:00.000Z`),
    })
  },
)

Given(
  'un compte RDV à déconnecter affichant les rendez-vous dans les activités',
  async () => {
    await seedCompteRdv({
      id: AGENT_ID,
      accessToken: 'jeton-acces',
      includeRdvsInActivitesList: true,
    })
  },
)

Given(
  'un compte RDV à déconnecter en erreur {string}',
  async (erreur: string) => {
    await seedCompteRdv({
      id: AGENT_ID,
      accessToken: 'jeton-acces',
      error: erreur,
    })
  },
)

Given('un compte RDV déjà déconnecté le {string}', async (jour: string) => {
  await seedCompteRdv({
    id: AGENT_ID,
    deleted: new Date(`${jour}T00:00:00.000Z`),
  })
})

Given('aucun compte RDV pour ce médiateur', () => {
  // Le hook Before de la feature a déjà retiré tout compte de l'utilisateur.
})

When('je déconnecte mon compte RDV Service Public', async () => {
  resultat = await deconnecter({ utilisateurId: testUtilisateurId })
})

Then('le compte est marqué déconnecté', async () => {
  assert.ok(resultat?.success, 'La déconnexion a échoué')
  assert.strictEqual(resultat.data._tag, 'deconnecte')

  const row = await compteRdvEnBase(AGENT_ID)
  assert.deepStrictEqual(row?.deleted, MAINTENANT)
})

Then('les jetons du compte sont purgés', async () => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.strictEqual(row?.accessToken, null)
  assert.strictEqual(row?.refreshToken, null)
  assert.strictEqual(row?.expiresAt, null)
  assert.strictEqual(row?.scope, null)
})

Then(
  'la fenêtre de synchronisation du compte est conservée au {string}',
  async (jour: string) => {
    const row = await compteRdvEnBase(AGENT_ID)
    assert.deepStrictEqual(row?.syncFrom, new Date(`${jour}T00:00:00.000Z`))
  },
)

Then(
  'le compte déconnecté affiche toujours les rendez-vous dans les activités',
  async () => {
    const row = await compteRdvEnBase(AGENT_ID)
    assert.strictEqual(row?.includeRdvsInActivitesList, true)
  },
)

Then('le compte déconnecté ne porte plus d’erreur', async () => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.strictEqual(row?.error, null)
})

Then('la date de déconnexion reste le {string}', async (jour: string) => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.deepStrictEqual(row?.deleted, new Date(`${jour}T00:00:00.000Z`))
})

Then('la déconnexion échoue avec l’erreur {string}', (tag: string) => {
  assert.ok(resultat && !resultat.success, 'La déconnexion aurait dû échouer')
  assert.strictEqual(resultat.error._tag, tag)
})
