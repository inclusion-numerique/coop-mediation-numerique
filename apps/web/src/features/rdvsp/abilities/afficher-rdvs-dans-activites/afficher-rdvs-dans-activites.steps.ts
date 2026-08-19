import assert from 'node:assert'
import type { AfficherRdvsDansActivites } from '@app/web/features/rdvsp/abilities/afficher-rdvs-dans-activites/domain/afficher-rdvs-dans-activites'
import { afficherRdvsDansActivites } from '@app/web/features/rdvsp/abilities/afficher-rdvs-dans-activites/implementation/prisma/afficher-rdvs-dans-activites.mutation'
import {
  compteRdvEnBase,
  ID_TEST,
  seedCompteRdv,
  testUtilisateurId,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

const AGENT_ID = ID_TEST.compte + 9

let reglage: Awaited<ReturnType<AfficherRdvsDansActivites>> | undefined

Given('un compte RDV masquant les rendez-vous dans les activités', async () => {
  await seedCompteRdv({
    id: AGENT_ID,
    accessToken: 'jeton-acces',
    includeRdvsInActivitesList: false,
  })
})

Given(
  'un compte RDV affichant les rendez-vous dans les activités',
  async () => {
    await seedCompteRdv({
      id: AGENT_ID,
      accessToken: 'jeton-acces',
      includeRdvsInActivitesList: true,
    })
  },
)

Given('aucun compte RDV pour régler l’affichage', () => {
  // Le hook Before de la feature a déjà retiré tout compte de l'utilisateur.
})

When('je demande à voir les rendez-vous dans mes activités', async () => {
  reglage = await afficherRdvsDansActivites({
    utilisateurId: testUtilisateurId,
    afficher: true,
  })
})

When('je demande à masquer les rendez-vous dans mes activités', async () => {
  reglage = await afficherRdvsDansActivites({
    utilisateurId: testUtilisateurId,
    afficher: false,
  })
})

Then('le compte affiche les rendez-vous dans les activités', async () => {
  assert.ok(reglage?.success, 'Le réglage a échoué')

  const row = await compteRdvEnBase(AGENT_ID)
  assert.strictEqual(row?.includeRdvsInActivitesList, true)
})

Then('le compte masque les rendez-vous dans les activités', async () => {
  assert.ok(reglage?.success, 'Le réglage a échoué')

  const row = await compteRdvEnBase(AGENT_ID)
  assert.strictEqual(row?.includeRdvsInActivitesList, false)
})

Then('le réglage échoue avec l’erreur {string}', (tag: string) => {
  assert.ok(reglage && !reglage.success, 'Le réglage aurait dû échouer')
  assert.strictEqual(reglage.error._tag, tag)
})
