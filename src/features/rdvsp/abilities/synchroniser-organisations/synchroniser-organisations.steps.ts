import assert from 'node:assert'
import { Given, Then, When, type World } from '@cucumber/cucumber'
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

type Monde = World & {
  recues?: Organisation[]
  apiRefuse?: boolean
  resultat?: Awaited<ReturnType<ReturnType<typeof synchroniserPour>>>
}

const synchroniserPour = (monde: Monde) =>
  synchroniserOrganisations({
    listerOrganisations: async () =>
      monde.apiRefuse
        ? failure(ApiIndisponible(503, 'service indisponible'))
        : success(monde.recues ?? []),
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
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given(
  'un compte RDV à synchroniser rattaché à l’organisation {int} nommée {string}',
  async (numero: number, nom: string) => {
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
  function (this: Monde, numero: number, nom: string) {
    this.recues = [
      ...(this.recues ?? []),
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

Given(
  'RDV Service Public refusera de lister les organisations',
  function (this: Monde) {
    this.apiRefuse = true
  },
)

When('je synchronise les organisations', async function (this: Monde) {
  this.resultat = await synchroniserPour(this)({
    compte: await compteUtilisable(),
  })
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

Then('le bilan compte {int} création', function (this: Monde, nombre: number) {
  assert.ok(this.resultat?.success, 'La synchronisation a échoué')
  assert.strictEqual(this.resultat.data.bilan.created, nombre)
})

Then(
  'le bilan compte {int} mise à jour',
  function (this: Monde, nombre: number) {
    assert.ok(this.resultat?.success, 'La synchronisation a échoué')
    assert.strictEqual(this.resultat.data.bilan.updated, nombre)
  },
)

Then(
  'le bilan compte {int} organisation inchangée',
  function (this: Monde, nombre: number) {
    assert.ok(this.resultat?.success, 'La synchronisation a échoué')
    assert.strictEqual(this.resultat.data.bilan.noop, nombre)
  },
)

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

Then(
  'la synchronisation échoue avec l’erreur {string}',
  function (this: Monde, tag: string) {
    assert.ok(
      this.resultat && !this.resultat.success,
      'La synchronisation aurait dû échouer',
    )
    assert.strictEqual(this.resultat.error._tag, tag)
  },
)
