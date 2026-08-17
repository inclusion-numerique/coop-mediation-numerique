import assert from 'node:assert'
import type { MettreAJourStatutRdv } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/domain/mettre-a-jour-statut-rdv'
import { mettreAJourStatutRdv } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/mettre-a-jour-statut-rdv'
import { contexteMiseAJourStatut } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/prisma/contexte-mise-a-jour-statut.query'
import { enregistrerStatutRdv } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementation/prisma/enregistrer-statut-rdv.mutation'
import { ApiIndisponible } from '@app/web/features/rdvsp/domain/errors'
import { RdvId } from '@app/web/features/rdvsp/domain/rdv-id'
import type { RdvServicePublicApi } from '@app/web/features/rdvsp/domain/rdv-service-public.port'
import {
  StatutPresence,
  StatutPresenceModifiable,
} from '@app/web/features/rdvsp/domain/statut-presence'
import {
  ID_TEST,
  rdvEnBase,
  seedCompteRdv,
  seedCompteRdvAutreMediateur,
  seedRdv,
  testUtilisateurId,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@app/web/libraries/result'
import { Given, Then, When } from '@cucumber/cucumber'

const AGENT_ID = ID_TEST.compte + 3
const AGENT_ID_AUTRE = ID_TEST.compte + 4
const RDV_ID = ID_TEST.rdv + 1
const RDV_ID_INEXISTANT = ID_TEST.rdv + 999

let statutConfirme: StatutPresence | null = null
let apiRefuse = false
let apiSollicitee = false
let resultat: Awaited<ReturnType<MettreAJourStatutRdv>> | undefined

/**
 * Double de l'API : il enregistre au passage s'il a été appelé, ce qui permet
 * d'affirmer qu'un refus d'accès s'arrête avant de sortir de La Coop — un
 * contrôle d'autorisation qui préviendrait quand même le tiers serait un contrôle
 * raté.
 */
const changerStatutRdvDouble: RdvServicePublicApi['changerStatutRdv'] = async (
  _compte,
  _rdvId,
  statut,
) => {
  apiSollicitee = true

  return apiRefuse
    ? failure(ApiIndisponible(503, 'service indisponible'))
    : success(statutConfirme ?? StatutPresence.schema.parse(statut))
}

const mettreAJour = mettreAJourStatutRdv({
  contexte: contexteMiseAJourStatut,
  changerStatutRdv: changerStatutRdvDouble,
  enregistrer: enregistrerStatutRdv,
})

const reinitialiserDouble = () => {
  statutConfirme = null
  apiRefuse = false
  apiSollicitee = false
}

Given('un rendez-vous à statuer sur mon compte RDV', async () => {
  reinitialiserDouble()
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
  await seedRdv({ id: RDV_ID, rdvAccountId: AGENT_ID })
})

Given(
  'un rendez-vous à statuer sur le compte RDV d’un autre médiateur',
  async () => {
    reinitialiserDouble()
    await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
    await seedCompteRdvAutreMediateur({ id: AGENT_ID_AUTRE })
    await seedRdv({ id: RDV_ID, rdvAccountId: AGENT_ID_AUTRE })
  },
)

Given('un compte RDV lié sans rendez-vous', async () => {
  reinitialiserDouble()
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given('aucun compte RDV pour statuer', () => {
  reinitialiserDouble()
})

Given('RDV Service Public confirmera le statut {string}', (statut: string) => {
  statutConfirme = StatutPresence.schema.parse(statut)
})

Given('RDV Service Public refusera la mise à jour', () => {
  apiRefuse = true
})

When('je déclare ce rendez-vous {string}', async (statut: string) => {
  resultat = await mettreAJour({
    utilisateurId: testUtilisateurId,
    rdvId: RdvId(RDV_ID),
    statut: StatutPresenceModifiable.schema.parse(statut),
  })
})

When(
  'je déclare un rendez-vous inexistant {string}',
  async (statut: string) => {
    resultat = await mettreAJour({
      utilisateurId: testUtilisateurId,
      rdvId: RdvId(RDV_ID_INEXISTANT),
      statut: StatutPresenceModifiable.schema.parse(statut),
    })
  },
)

Then('le rendez-vous porte le statut {string}', async (statut: string) => {
  assert.ok(resultat?.success, 'La mise à jour a échoué')
  assert.strictEqual((await rdvEnBase(RDV_ID))?.status, statut)
})

Then(
  'le rendez-vous porte toujours le statut {string}',
  async (statut: string) => {
    assert.strictEqual((await rdvEnBase(RDV_ID))?.status, statut)
  },
)

Then('le rendez-vous est marqué sans CRA à renseigner', async () => {
  assert.strictEqual((await rdvEnBase(RDV_ID))?.craDeclined, true)
})

Then('le rendez-vous attend toujours un CRA', async () => {
  assert.strictEqual((await rdvEnBase(RDV_ID))?.craDeclined, false)
})

Then('la mise à jour échoue avec l’erreur {string}', (tag: string) => {
  assert.ok(resultat && !resultat.success, 'La mise à jour aurait dû échouer')
  assert.strictEqual(resultat.error._tag, tag)
})

Then('RDV Service Public n’a pas été sollicité', () => {
  assert.strictEqual(
    apiSollicitee,
    false,
    'L’API ne devait pas être appelée sans autorisation',
  )
})
