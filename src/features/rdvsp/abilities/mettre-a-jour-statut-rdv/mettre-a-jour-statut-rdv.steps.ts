import assert from 'node:assert'
import { Given, Then, When, type World } from '@cucumber/cucumber'
import { mettreAJourStatutRdv } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/domain/mettre-a-jour-statut-rdv'
import { contexteMiseAJourStatut } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/prisma/contexte-mise-a-jour-statut.query'
import { enregistrerStatutRdv } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/prisma/enregistrer-statut-rdv.mutation'
import { ApiIndisponible } from '@/features/rdvsp/domain/errors'
import { RdvId } from '@/features/rdvsp/domain/identifiants/rdv-id'
import {
  StatutPresence,
  StatutPresenceModifiable,
} from '@/features/rdvsp/domain/rdv/statut-presence'
import {
  ID_TEST,
  rdvEnBase,
  seedCompteRdv,
  seedCompteRdvAutreMediateur,
  seedRdv,
  testUtilisateurId,
} from '@/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@/libraries/result'

const AGENT_ID = ID_TEST.compte + 3
const AGENT_ID_AUTRE = ID_TEST.compte + 4
const RDV_ID = ID_TEST.rdv + 1
const RDV_ID_INEXISTANT = ID_TEST.rdv + 999

type Monde = World & {
  statutConfirme?: StatutPresence
  apiRefuse?: boolean
  apiSollicitee?: boolean
  resultat?: Awaited<ReturnType<ReturnType<typeof mettreAJourPour>>>
}

const mettreAJourPour = (monde: Monde) =>
  mettreAJourStatutRdv({
    contexte: contexteMiseAJourStatut,
    changerStatutRdv: async (_compte, _rdvId, statut) => {
      monde.apiSollicitee = true

      return monde.apiRefuse
        ? failure(ApiIndisponible(503, 'service indisponible'))
        : success(monde.statutConfirme ?? StatutPresence.schema.parse(statut))
    },
    enregistrer: enregistrerStatutRdv,
  })

Given('un rendez-vous à statuer sur mon compte RDV', async () => {
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
  await seedRdv({ id: RDV_ID, rdvAccountId: AGENT_ID })
})

Given(
  'un rendez-vous à statuer sur le compte RDV d’un autre médiateur',
  async () => {
    await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
    await seedCompteRdvAutreMediateur({ id: AGENT_ID_AUTRE })
    await seedRdv({ id: RDV_ID, rdvAccountId: AGENT_ID_AUTRE })
  },
)

Given('un compte RDV lié sans rendez-vous', async () => {
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given('aucun compte RDV pour statuer', () => undefined)

Given(
  'RDV Service Public confirmera le statut {string}',
  function (this: Monde, statut: string) {
    this.statutConfirme = StatutPresence.schema.parse(statut)
  },
)

Given('RDV Service Public refusera la mise à jour', function (this: Monde) {
  this.apiRefuse = true
})

When(
  'je déclare ce rendez-vous {string}',
  async function (this: Monde, statut: string) {
    this.resultat = await mettreAJourPour(this)({
      utilisateurId: testUtilisateurId,
      rdvId: RdvId(RDV_ID),
      statut: StatutPresenceModifiable.schema.parse(statut),
    })
  },
)

When(
  'je déclare un rendez-vous inexistant {string}',
  async function (this: Monde, statut: string) {
    this.resultat = await mettreAJourPour(this)({
      utilisateurId: testUtilisateurId,
      rdvId: RdvId(RDV_ID_INEXISTANT),
      statut: StatutPresenceModifiable.schema.parse(statut),
    })
  },
)

Then(
  'le rendez-vous porte le statut {string}',
  async function (this: Monde, statut: string) {
    assert.ok(this.resultat?.success, 'La mise à jour a échoué')
    assert.strictEqual((await rdvEnBase(RDV_ID))?.status, statut)
  },
)

Then(
  'le rendez-vous porte toujours le statut {string}',
  async (statut: string) => {
    assert.strictEqual((await rdvEnBase(RDV_ID))?.status, statut)
  },
)

Then('le rendez-vous est marqué sans CRA à renseigner', async () => {
  assert.strictEqual((await rdvEnBase(RDV_ID))?.compteRenduRegle, true)
})

Then('le rendez-vous attend toujours un CRA', async () => {
  assert.strictEqual((await rdvEnBase(RDV_ID))?.compteRenduRegle, false)
})

Then(
  'la mise à jour échoue avec l’erreur {string}',
  function (this: Monde, tag: string) {
    assert.ok(
      this.resultat && !this.resultat.success,
      'La mise à jour aurait dû échouer',
    )
    assert.strictEqual(this.resultat.error._tag, tag)
  },
)

Then('RDV Service Public n’a pas été sollicité', function (this: Monde) {
  assert.notStrictEqual(
    this.apiSollicitee,
    true,
    'L’API ne devait pas être appelée sans autorisation',
  )
})
