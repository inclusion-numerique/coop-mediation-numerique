import assert from 'node:assert'
import type { SynchroniserOrganisations } from '@app/web/features/rdvsp/abilities/synchroniser-organisations/domain/synchroniser-organisations'
import { appliquerPlanOrganisations } from '@app/web/features/rdvsp/abilities/synchroniser-organisations/implementation/prisma/appliquer-plan-organisations.mutation'
import { etatOrganisations } from '@app/web/features/rdvsp/abilities/synchroniser-organisations/implementation/prisma/etat-organisations.query'
import { synchroniserOrganisations } from '@app/web/features/rdvsp/abilities/synchroniser-organisations/implementation/synchroniser-organisations'
import { compteRdvToDomain } from '@app/web/features/rdvsp/db'
import {
  type CompteRdvUtilisable,
  estUtilisable,
} from '@app/web/features/rdvsp/domain/compte-rdv'
import { ApiIndisponible } from '@app/web/features/rdvsp/domain/errors'
import { NomOrganisation } from '@app/web/features/rdvsp/domain/libelle'
import type { Organisation } from '@app/web/features/rdvsp/domain/organisation'
import { OrganisationId } from '@app/web/features/rdvsp/domain/organisation-id'
import type { RdvServicePublicApi } from '@app/web/features/rdvsp/domain/rdv-service-public.port'
import {
  compteRdvEnBase,
  ID_TEST,
  organisationEnBase,
  rattachementsDuCompte,
  seedCompteRdv,
  seedOrganisation,
  seedRattachement,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@app/web/libraries/result'
import { Given, Then, When } from '@cucumber/cucumber'

const AGENT_ID = ID_TEST.compte + 8

let recues: Organisation[] = []
let apiRefuse = false
let resultat: Awaited<ReturnType<SynchroniserOrganisations>> | undefined

const listerOrganisationsDouble: RdvServicePublicApi['listerOrganisations'] =
  async () =>
    apiRefuse
      ? failure(ApiIndisponible(503, 'service indisponible'))
      : success(recues)

const synchroniser = synchroniserOrganisations({
  listerOrganisations: listerOrganisationsDouble,
  etatOrganisations,
  appliquerPlan: appliquerPlanOrganisations,
})

const compteUtilisable = async (): Promise<CompteRdvUtilisable> => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.ok(row, 'Aucun compte RDV en base')
  const compte = compteRdvToDomain(row)
  assert.ok(estUtilisable(compte), 'Le compte devrait être utilisable')
  return compte
}

Given('un compte RDV à synchroniser sans organisation', async () => {
  recues = []
  apiRefuse = false
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given(
  'un compte RDV à synchroniser rattaché à l’organisation {int} nommée {string}',
  async (numero: number, nom: string) => {
    recues = []
    apiRefuse = false
    const organisationId = ID_TEST.organisation + numero
    await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
    await seedOrganisation({ id: organisationId, nom })
    await seedRattachement({ agentId: AGENT_ID, organisationId })
  },
)

Given(
  'un rattachement résiduel à l’organisation {int}',
  async (numero: number) => {
    const organisationId = ID_TEST.organisation + numero
    await seedOrganisation({ id: organisationId, nom: 'Organisation quittée' })
    await seedRattachement({ agentId: AGENT_ID, organisationId })
  },
)

Given(
  'RDV Service Public renvoie l’organisation {int} nommée {string}',
  (numero: number, nom: string) => {
    recues = [
      ...recues,
      {
        id: OrganisationId(ID_TEST.organisation + numero),
        nom: NomOrganisation(nom),
        email: null,
        telephone: null,
        verticale: null,
      },
    ]
  },
)

Given('RDV Service Public refusera de lister les organisations', () => {
  apiRefuse = true
})

When('je synchronise les organisations', async () => {
  resultat = await synchroniser(await compteUtilisable())
})

Then(
  'l’organisation {int} existe et se nomme {string}',
  async (numero: number, nom: string) => {
    const organisation = await organisationEnBase(ID_TEST.organisation + numero)
    assert.strictEqual(organisation?.name, nom)
  },
)

Then('l’organisation {int} n’existe pas', async (numero: number) => {
  assert.strictEqual(
    await organisationEnBase(ID_TEST.organisation + numero),
    null,
  )
})

Then('le bilan compte {int} création', (nombre: number) => {
  assert.ok(resultat?.success, 'La synchronisation a échoué')
  assert.strictEqual(resultat.data.created, nombre)
})

Then('le bilan compte {int} mise à jour', (nombre: number) => {
  assert.ok(resultat?.success, 'La synchronisation a échoué')
  assert.strictEqual(resultat.data.updated, nombre)
})

Then('le bilan compte {int} organisation inchangée', (nombre: number) => {
  assert.ok(resultat?.success, 'La synchronisation a échoué')
  assert.strictEqual(resultat.data.noop, nombre)
})

Then(
  'le compte est rattaché à l’organisation {int}',
  async (numero: number) => {
    assert.ok(
      (await rattachementsDuCompte(AGENT_ID)).includes(
        ID_TEST.organisation + numero,
      ),
    )
  },
)

Then(
  'le compte n’est plus rattaché à l’organisation {int}',
  async (numero: number) => {
    assert.ok(
      !(await rattachementsDuCompte(AGENT_ID)).includes(
        ID_TEST.organisation + numero,
      ),
    )
  },
)

Then('la synchronisation échoue avec l’erreur {string}', (tag: string) => {
  assert.ok(
    resultat && !resultat.success,
    'La synchronisation aurait dû échouer',
  )
  assert.strictEqual(resultat.error._tag, tag)
})
