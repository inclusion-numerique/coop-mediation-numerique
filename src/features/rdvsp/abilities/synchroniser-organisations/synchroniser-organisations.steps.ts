import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { synchroniserOrganisations } from '@/features/rdvsp/abilities/synchroniser-organisations/domain/synchroniser-organisations'
import { appliquerPlanOrganisations } from '@/features/rdvsp/abilities/synchroniser-organisations/implementations/prisma/appliquer-plan-organisations.mutation'
import { etatOrganisations } from '@/features/rdvsp/abilities/synchroniser-organisations/implementations/prisma/etat-organisations.query'
import {
  type CompteRdvUtilisable,
  estUtilisable,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import { ApiIndisponible } from '@/features/rdvsp/domain/errors'
import { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import { NomOrganisation } from '@/features/rdvsp/domain/libelle'
import type { Organisation } from '@/features/rdvsp/domain/organisation'
import type { RdvServicePublicApi } from '@/features/rdvsp/domain/ports'
import { compteRdvToDomain } from '@/features/rdvsp/implementations/prisma/compte-rdv.transfer'
import {
  compteRdvEnBase,
  ID_TEST,
  organisationEnBase,
  rattachementsDuCompte,
  seedCompteRdv,
  seedOrganisation,
  seedRattachement,
} from '@/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@/libraries/result'

const AGENT_ID = ID_TEST.compte + 8

let recues: Organisation[] = []
let apiRefuse = false
let resultat: Awaited<ReturnType<typeof synchroniser>> | undefined

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
  resultat = await synchroniser({ compte: await compteUtilisable() })
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
  assert.strictEqual(resultat.data.bilan.created, nombre)
})

Then('le bilan compte {int} mise à jour', (nombre: number) => {
  assert.ok(resultat?.success, 'La synchronisation a échoué')
  assert.strictEqual(resultat.data.bilan.updated, nombre)
})

Then('le bilan compte {int} organisation inchangée', (nombre: number) => {
  assert.ok(resultat?.success, 'La synchronisation a échoué')
  assert.strictEqual(resultat.data.bilan.noop, nombre)
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
