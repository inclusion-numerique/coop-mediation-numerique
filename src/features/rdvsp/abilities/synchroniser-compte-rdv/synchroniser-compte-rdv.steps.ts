import assert from 'node:assert'
import { Given, Then, When, type World } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { failure, success } from '@/libraries/result'
import { bilanVide } from '../../domain/compte/bilan-synchronisation'
import { estUtilisable } from '../../domain/compte/compte-rdv'
import { ApiIndisponible, ErreurTechnique } from '../../domain/errors'
import { MediateurId } from '../../domain/identifiants/mediateur-id'
import { OrganisationId } from '../../domain/identifiants/organisation-id'
import { abonnementsDeLaCoop, WebhookId } from '../../domain/webhook/webhook'
import { compteRdvToDomain } from '../../implementations/prisma/compte-rdv.transfer'
import { compteRdvEnBase, ID_TEST, seedCompteRdv } from '../../rdvsp.cucumber'
import type { ResultatSynchronisation } from './domain/resultat-synchronisation'
import { synchroniserCompteRdv } from './domain/synchroniser-compte-rdv'
import {
  cloturerJournal,
  echouerJournal,
  ouvrirJournal,
} from './implementations/prisma/journal-synchronisation.mutation'

const AGENT_ID = ID_TEST.compte + 8

const appels: string[] = []

const echecs = new Set<string>()
const exceptions = new Set<string>()
const organisationsRecues: number[] = []
const organisationsRefusees: number[] = []
const organisationsDetachees: number[] = []
const webhooksVises: {
  organisationsDuCompte: readonly number[]
  organisation: number
}[] = []
type Monde = World & {
  organisationIdsRecusParLesRdvs?: readonly OrganisationId[] | undefined
  organisationsSansWebhook?: readonly number[]
  resultat?: ResultatSynchronisation | undefined
  echoue?: boolean
}

const reinitialiser = () => {
  appels.length = 0
  echecs.clear()
  exceptions.clear()
  organisationsRecues.length = 0
  organisationsRefusees.length = 0
  organisationsDetachees.length = 0
  webhooksVises.length = 0
}

const unChangement = { ...bilanVide, updated: 1 }

const MEDIATEUR_ID = MediateurId('b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b')

const ORGANISATIONS_DU_COMPTE = [101, 102]

const synchroniserPour = (monde: Monde) =>
  synchroniserCompteRdv({
    reconcilierOrganisations: async () => {
      appels.push('organisations')

      return echecs.has('organisations')
        ? failure(ApiIndisponible(503, 'service indisponible'))
        : success({
            bilan: unChangement,
            organisationIdsRecues: (organisationsRecues.length > 0
              ? organisationsRecues
              : ORGANISATIONS_DU_COMPTE
            ).map((id) => OrganisationId(id)),
          })
    },
    reconcilierRdvs: async ({ organisationIds }) => {
      appels.push('rendez-vous')
      monde.organisationIdsRecusParLesRdvs = organisationIds

      if (exceptions.has('rendez-vous')) {
        return failure(ErreurTechnique(new Error('la réconciliation a levé')))
      }

      return echecs.has('rendez-vous')
        ? failure(ApiIndisponible(503, 'service indisponible'))
        : success({
            rdvs: unChangement,
            usagers: unChangement,
            motifs: bilanVide,
            lieux: bilanVide,
            organisationIdsInaccessibles: (organisationIds ?? [])
              .filter((id) => organisationsRefusees.includes(id))
              .map((id) => OrganisationId(id)),
            rapprochements: [],
          })
    },
    listerWebhooksDeLaCoop: async (compte, organisationId) => {
      if (appels.at(-1) !== 'webhooks') appels.push('webhooks')
      webhooksVises.push({
        organisationsDuCompte: compte.organisationIds,
        organisation: organisationId,
      })

      return monde.organisationsSansWebhook?.includes(organisationId)
        ? failure(ApiIndisponible(503, 'service indisponible'))
        : success([
            {
              id: WebhookId(1),
              organisationId,
              abonnements: abonnementsDeLaCoop,
            },
          ])
    },
    poserWebhook: async () => failure(ApiIndisponible(503, 'inattendu')),
    relireWebhooksDeLaCoop: async () => success([]),
    reconfigurerWebhook: async () => failure(ApiIndisponible(503, 'inattendu')),
    destinationDesWebhooksJoignable: () => false,
    noterLesWebhooksInvalides: async () => success(undefined),
    detacherOrganisations: async ({ organisationIds }) => {
      organisationsDetachees.push(...organisationIds)
      return success(undefined)
    },
    ouvrirJournal,
    cloturerJournal,
    echouerJournal,
    noterLaSynchronisationReussie: async () => success(undefined),
  })

const compteUtilisable = async () => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.ok(row, 'Aucun compte RDV en base')

  const compte = compteRdvToDomain(row)
  assert.ok(estUtilisable(compte), 'Le compte devrait être utilisable')

  return {
    ...compte,
    organisationIds: ORGANISATIONS_DU_COMPTE.map((id) => OrganisationId(id)),
  }
}

const journauxDuCompte = async () =>
  prismaClient.rdvSyncLog.findMany({
    where: { rdvAccountId: AGENT_ID },
    select: {
      ended: true,
      error: true,
      drift: true,
      organisationIds: true,
    },
  })

Given('un compte RDV à réconcilier', async () => {
  reinitialiser()
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given('la réconciliation des organisations échoue', () => {
  echecs.add('organisations')
})

Given('la réconciliation des rendez-vous échoue', () => {
  echecs.add('rendez-vous')
})

Given(
  'RDV Service Public ne renvoie que les organisations {string}',
  (ids: string) => {
    organisationsRecues.push(...ids.split(',').map(Number))
  },
)

Given(
  'l’organisation {string} refuse l’accès à ses rendez-vous',
  (id: string) => {
    organisationsRefusees.push(Number(id))
  },
)

Given('la réconciliation des rendez-vous lève une exception', () => {
  exceptions.add('rendez-vous')
})

Given(
  'la pose de webhook échoue sur l’organisation {string}',
  function (this: Monde, ids: string) {
    this.organisationsSansWebhook = ids.split(',').map(Number)
  },
)

When('je synchronise tout le compte', async function (this: Monde) {
  const reponse = await synchroniserPour(this)({
    compte: await compteUtilisable(),
    mediateurId: MEDIATEUR_ID,
    maintenant: new Date(),
  })

  this.echoue = !reponse.success
  this.resultat = reponse.success ? reponse.data : undefined
})

When(
  'je synchronise tout le compte en rattrapant l’exception',
  async function (this: Monde) {
    const reponse = await synchroniserPour(this)({
      compte: await compteUtilisable(),
      mediateurId: MEDIATEUR_ID,
      maintenant: new Date(),
    })

    this.echoue = !reponse.success
  },
)

When('je synchronise une portée vide', async function (this: Monde) {
  const reponse = await synchroniserPour(this)({
    compte: await compteUtilisable(),
    mediateurId: MEDIATEUR_ID,
    maintenant: new Date(),
    organisationIds: [],
  })

  this.echoue = !reponse.success
  this.resultat = reponse.success ? reponse.data : undefined
})

When(
  'je synchronise les organisations {string}',
  async function (this: Monde, ids: string) {
    const reponse = await synchroniserPour(this)({
      compte: await compteUtilisable(),
      mediateurId: MEDIATEUR_ID,
      maintenant: new Date(),
      organisationIds: ids.split(',').map((id) => OrganisationId(Number(id))),
    })

    this.echoue = !reponse.success
    this.resultat = reponse.success ? reponse.data : undefined
  },
)

Then(
  'les réconciliations se sont enchaînées dans l’ordre {string}',
  (attendu: string) => {
    assert.deepEqual(appels, attendu.split(','))
  },
)

Then('aucune réconciliation n’a été lancée', () => {
  assert.deepEqual(appels, [])
})

Then('la passe de synchronisation échoue', function (this: Monde) {
  assert.ok(this.echoue, 'La synchronisation aurait dû échouer')
})

Then(
  'la passe rend une dérive de {int}',
  function (this: Monde, attendue: number) {
    assert.equal(this.resultat?.derive, attendue)
  },
)

Then(
  'les rendez-vous ont été réconciliés sur les organisations {string}',
  function (this: Monde, ids: string) {
    assert.deepEqual(
      this.organisationIdsRecusParLesRdvs?.map(Number),
      ids.split(',').map(Number),
    )
  },
)

Then(
  'la passe signale les organisations sans webhook {string}',
  function (this: Monde, ids: string) {
    assert.deepEqual(
      this.resultat?.organisationIdsSansWebhook?.map(Number),
      ids.split(',').map(Number),
    )
  },
)

Then(
  'les organisations {string} ont été détachées du compte',
  (ids: string) => {
    assert.deepEqual(organisationsDetachees, ids.split(',').map(Number))
  },
)

Then('aucune organisation n’a été détachée du compte', () => {
  assert.deepEqual(organisationsDetachees, [])
})

Then(
  'les webhooks ont été réconciliés sur les organisations {string}',
  (ids: string) => {
    assert.deepEqual(
      webhooksVises.map(({ organisation }) => organisation),
      ids.split(',').map(Number),
    )
  },
)

Then(
  'les webhooks ont visé les seules organisations reçues {string}',
  (ids: string) => {
    assert.deepEqual(
      webhooksVises[0]?.organisationsDuCompte.map(Number),
      ids.split(',').map(Number),
    )
  },
)

Then('le journal de la passe est clôturé sans erreur', async () => {
  const journaux = await journauxDuCompte()

  assert.equal(journaux.length, 1, 'Un seul journal attendu')
  assert.ok(journaux[0]?.ended, 'Le journal devrait être clôturé')
  assert.equal(journaux[0]?.error, null)
})

Then(
  'le journal de la passe consigne la portée {string}',
  async (ids: string) => {
    const [journal] = await journauxDuCompte()

    assert.deepEqual(journal?.organisationIds, ids.split(',').map(Number))
  },
)

Then('le journal de la passe consigne une portée complète', async () => {
  const [journal] = await journauxDuCompte()

  assert.deepEqual(journal?.organisationIds, [])
})

Then('le journal de la passe porte une erreur', async () => {
  const journaux = await journauxDuCompte()

  assert.equal(journaux.length, 1, 'Un seul journal attendu')
  assert.ok(journaux[0]?.error, 'Le journal devrait porter une erreur')
})

Then('aucun journal de passe n’a été ouvert', async () => {
  assert.deepEqual(await journauxDuCompte(), [])
})
