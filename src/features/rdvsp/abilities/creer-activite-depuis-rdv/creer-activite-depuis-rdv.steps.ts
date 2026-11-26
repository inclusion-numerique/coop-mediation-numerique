import assert from 'node:assert'
import { After, Given, Then, When, type World } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { creerActiviteDepuisRdv } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/creer-activite-depuis-rdv'
import type {
  CreerOuFusionnerBeneficiaires,
  PreparerUrlCreationCra,
} from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/domain/ports'
import { compteDuRedacteur } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/implementations/prisma/compte-du-redacteur.query'
import { lireRdvPourActivite } from '@/features/rdvsp/abilities/creer-activite-depuis-rdv/implementations/prisma/lire-rdv-pour-activite.query'
import { MediateurId } from '@/features/rdvsp/domain/identifiants/mediateur-id'
import { RdvId } from '@/features/rdvsp/domain/identifiants/rdv-id'
import { StatutPresence } from '@/features/rdvsp/domain/rdv/statut-presence'
import {
  ID_TEST,
  seedCompteRdv,
  seedCompteRdvAutreMediateur,
  seedParticipation,
  seedRdv,
  testMediateurId,
  testUtilisateurId,
} from '@/features/rdvsp/rdvsp.cucumber'
import { success } from '@/libraries/result'

const confies: { usagers: number[] } = { usagers: [] }

const creerActiviteDepuisRdvAvec = (
  preparerUrlCreationCra: PreparerUrlCreationCra,
  creerOuFusionner: CreerOuFusionnerBeneficiaires,
) =>
  creerActiviteDepuisRdv({
    lireRdv: lireRdvPourActivite,
    compteDuRedacteur,
    creerOuFusionnerBeneficiaires: creerOuFusionner,
    preparerUrlCreationCra,
  })

const creerActiviteDepuisUnRdv = creerActiviteDepuisRdvAvec(
  ({ rendezVous }) =>
    Promise.resolve(
      `/coop/mes-activites/cra/${rendezVous.collectif ? 'collectif' : 'individuel'}?rdv=${rendezVous.id}`,
    ),
  async ({ usagers, mediateurId }) => {
    confies.usagers = [
      ...confies.usagers,
      ...usagers.map(({ rdvUserId }) => rdvUserId),
    ]
    return success({
      merges: usagers.map(({ prenom, nom, email, telephone, adresse }) => ({
        id: v4(),
        prenom,
        nom,
        email,
        telephone,
        mediateurId,
        adresse,
        anneeNaissance: null,
        commune: null,
      })),
    })
  },
)

const AGENT_ID = ID_TEST.compte + 6
const AGENT_ID_AUTRE = ID_TEST.compte + 7
const RDV_ID = ID_TEST.rdv + 101
const PARTICIPATION_ID = ID_TEST.participation + 101
const RDV_ID_INEXISTANT = ID_TEST.rdv + 199
const USAGER_ID = ID_TEST.usager + 101
const USAGER_ID_SECOND = ID_TEST.usager + 102

type Monde = World & {
  resultat?: Awaited<ReturnType<typeof creerActiviteDepuisUnRdv>>
}

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

Given('aucun compte RDV pour convertir', () => undefined)

When('je prépare un CRA depuis ce rendez-vous', async function (this: Monde) {
  this.resultat = await creerActiviteDepuisUnRdv({
    utilisateurId: testUtilisateurId,
    mediateurId: MediateurId(testMediateurId),
    maintenant: new Date(),
    rdvId: RdvId(RDV_ID),
  })
})

When(
  'je prépare un CRA depuis un rendez-vous inexistant',
  async function (this: Monde) {
    this.resultat = await creerActiviteDepuisUnRdv({
      utilisateurId: testUtilisateurId,
      mediateurId: MediateurId(testMediateurId),
      maintenant: new Date(),
      rdvId: RdvId(RDV_ID_INEXISTANT),
    })
  },
)

Then('le CRA est prêt à être rédigé', function (this: Monde) {
  assert.ok(this.resultat?.success, 'La préparation a échoué')
  assert.match(
    this.resultat.data.urlCreationCra,
    /\/coop\/mes-activites\/cra\//,
  )
})

Then(
  '{int} participant est confié à la création des bénéficiaires',
  (nombre: number) => {
    assert.strictEqual(confies.usagers.length, nombre)
  },
)

Then('aucun participant n’est confié à la création des bénéficiaires', () => {
  assert.deepStrictEqual(confies.usagers, [])
})

Then(
  'la préparation échoue avec l’erreur {string}',
  function (this: Monde, tag: string) {
    assert.ok(
      this.resultat && !this.resultat.success,
      'La préparation aurait dû échouer',
    )
    assert.strictEqual(this.resultat.error._tag, tag)
  },
)

After(() => {
  confies.usagers = []
})
