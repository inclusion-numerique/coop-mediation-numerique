import assert from 'node:assert'
import type { CreerActiviteDepuisRdv } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/creer-activite-depuis-rdv'
import { MediateurRedacteurId } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/rdv-pour-activite'
import { creerActiviteDepuisRdvBinding } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/implementation/creer-activite-depuis-rdv.binding'
import { RdvId } from '@app/web/features/rdvsp/domain/rdv-id'
import { StatutPresence } from '@app/web/features/rdvsp/domain/statut-presence'
import {
  beneficiairesDuMediateurAvecUsagers,
  ID_TEST,
  seedCompteRdv,
  seedCompteRdvAutreMediateur,
  seedParticipation,
  seedRdv,
  testMediateurId,
  testUtilisateurId,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

const AGENT_ID = ID_TEST.compte + 6
const AGENT_ID_AUTRE = ID_TEST.compte + 7
const RDV_ID = ID_TEST.rdv + 101
const PARTICIPATION_ID = ID_TEST.participation + 101
const RDV_ID_INEXISTANT = ID_TEST.rdv + 199
const USAGER_ID = ID_TEST.usager + 101
const USAGER_ID_SECOND = ID_TEST.usager + 102

let resultat: Awaited<ReturnType<CreerActiviteDepuisRdv>> | undefined

Given(
  'un rendez-vous à convertir avec un participant {string}',
  async (statut: string) => {
    await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
    await seedRdv({ id: RDV_ID, rdvAccountId: AGENT_ID })
    await seedParticipation({
      id: PARTICIPATION_ID,
      rdvId: RDV_ID,
      usagerId: USAGER_ID,
      status: StatutPresence.schema.parse(statut),
    })
  },
)

Given(
  'un rendez-vous à convertir {string} avec un participant {string}',
  async (statutDuRdv: string, statutDuParticipant: string) => {
    await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
    await seedRdv({
      id: RDV_ID,
      rdvAccountId: AGENT_ID,
      status: StatutPresence.schema.parse(statutDuRdv),
    })
    await seedParticipation({
      id: PARTICIPATION_ID,
      rdvId: RDV_ID,
      usagerId: USAGER_ID,
      status: StatutPresence.schema.parse(statutDuParticipant),
    })
  },
)

Given(
  'un second participant {string} sur ce rendez-vous',
  async (statut: string) => {
    await seedParticipation({
      id: PARTICIPATION_ID + 1,
      rdvId: RDV_ID,
      usagerId: USAGER_ID_SECOND,
      status: StatutPresence.schema.parse(statut),
    })
  },
)

Given(
  'un rendez-vous à convertir appartenant à un autre médiateur',
  async () => {
    await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
    await seedCompteRdvAutreMediateur({ id: AGENT_ID_AUTRE })
    await seedRdv({ id: RDV_ID, rdvAccountId: AGENT_ID_AUTRE })
    await seedParticipation({
      id: PARTICIPATION_ID,
      rdvId: RDV_ID,
      usagerId: USAGER_ID,
      status: 'seen',
    })
  },
)

Given('un compte RDV lié sans rendez-vous à convertir', async () => {
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given('aucun compte RDV pour convertir', () => {
  // Le hook Before a déjà retiré tout compte de l'utilisateur de test.
})

When('je prépare un CRA depuis ce rendez-vous', async () => {
  resultat = await creerActiviteDepuisRdvBinding({
    utilisateurId: testUtilisateurId,
    mediateurId: MediateurRedacteurId(testMediateurId),
    rdvId: RdvId(RDV_ID),
  })
})

When('je prépare un CRA depuis un rendez-vous inexistant', async () => {
  resultat = await creerActiviteDepuisRdvBinding({
    utilisateurId: testUtilisateurId,
    mediateurId: MediateurRedacteurId(testMediateurId),
    rdvId: RdvId(RDV_ID_INEXISTANT),
  })
})

Then('le CRA est prêt à être rédigé', () => {
  assert.ok(resultat?.success, 'La préparation a échoué')
  assert.match(resultat.data.urlCreationCra, /\/coop\/mes-activites\/cra\//)
})

Then(
  '{int} bénéficiaire a été créé depuis les participants',
  async (nombre: number) => {
    assert.strictEqual(
      (await beneficiairesDuMediateurAvecUsagers()).length,
      nombre,
    )
  },
)

Then('aucun bénéficiaire n’a été créé depuis les participants', async () => {
  assert.strictEqual((await beneficiairesDuMediateurAvecUsagers()).length, 0)
})

Then('la préparation échoue avec l’erreur {string}', (tag: string) => {
  assert.ok(resultat && !resultat.success, 'La préparation aurait dû échouer')
  assert.strictEqual(resultat.error._tag, tag)
})
