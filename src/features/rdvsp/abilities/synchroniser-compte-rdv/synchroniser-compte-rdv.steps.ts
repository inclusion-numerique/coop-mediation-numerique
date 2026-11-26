import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
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

/** Ordre d'appel observé, seule façon de constater l'enchaînement du dehors. */
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
let organisationIdsRecusParLesRdvs: readonly number[] | undefined
let organisationsSansWebhook: readonly number[] | undefined
let resultat: ResultatSynchronisation | undefined
let echoue = false

const reinitialiser = () => {
  appels.length = 0
  echecs.clear()
  exceptions.clear()
  organisationsRecues.length = 0
  organisationsRefusees.length = 0
  organisationsDetachees.length = 0
  webhooksVises.length = 0
  organisationIdsRecusParLesRdvs = undefined
  organisationsSansWebhook = undefined
  resultat = undefined
  echoue = false
}

/**
 * Chaque réconciliation rend une opération, pour que la dérive attendue soit
 * lisible : trois modèles à 1, donc une dérive de 3.
 */
const unChangement = { ...bilanVide, updated: 1 }

const MEDIATEUR_ID = MediateurId('b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b')

/**
 * Organisations auxquelles le compte est rattaché, et que RDV Service Public
 * renvoie sauf scénario contraire : sans elles, la passe n'a aucun webhook à
 * poser, et l'étape ne se constate pas.
 */
const ORGANISATIONS_DU_COMPTE = [101, 102]

const synchroniser = synchroniserCompteRdv({
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
    organisationIdsRecusParLesRdvs = organisationIds

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

    return organisationsSansWebhook?.includes(organisationId)
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
  (ids: string) => {
    organisationsSansWebhook = ids.split(',').map(Number)
  },
)

When('je synchronise tout le compte', async () => {
  const reponse = await synchroniser({
    compte: await compteUtilisable(),
    mediateurId: MEDIATEUR_ID,
    maintenant: new Date(),
  })

  echoue = !reponse.success
  resultat = reponse.success ? reponse.data : undefined
})

When('je synchronise tout le compte en rattrapant l’exception', async () => {
  const reponse = await synchroniser({
    compte: await compteUtilisable(),
    mediateurId: MEDIATEUR_ID,
    maintenant: new Date(),
  })

  echoue = !reponse.success
})

When('je synchronise une portée vide', async () => {
  const reponse = await synchroniser({
    compte: await compteUtilisable(),
    mediateurId: MEDIATEUR_ID,
    maintenant: new Date(),
    organisationIds: [],
  })

  echoue = !reponse.success
  resultat = reponse.success ? reponse.data : undefined
})

When('je synchronise les organisations {string}', async (ids: string) => {
  const reponse = await synchroniser({
    compte: await compteUtilisable(),
    mediateurId: MEDIATEUR_ID,
    maintenant: new Date(),
    organisationIds: ids.split(',').map((id) => OrganisationId(Number(id))),
  })

  echoue = !reponse.success
  resultat = reponse.success ? reponse.data : undefined
})

Then(
  'les réconciliations se sont enchaînées dans l’ordre {string}',
  (attendu: string) => {
    assert.deepEqual(appels, attendu.split(','))
  },
)

Then('aucune réconciliation n’a été lancée', () => {
  assert.deepEqual(appels, [])
})

Then('la passe de synchronisation échoue', () => {
  assert.ok(echoue, 'La synchronisation aurait dû échouer')
})

Then('la passe rend une dérive de {int}', (attendue: number) => {
  assert.equal(resultat?.derive, attendue)
})

Then(
  'les rendez-vous ont été réconciliés sur les organisations {string}',
  (ids: string) => {
    assert.deepEqual(
      organisationIdsRecusParLesRdvs?.map(Number),
      ids.split(',').map(Number),
    )
  },
)

Then(
  'la passe signale les organisations sans webhook {string}',
  (ids: string) => {
    assert.deepEqual(
      resultat?.organisationIdsSansWebhook?.map(Number),
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

/**
 * La portée est une écriture que personne ne relit dans le code : sans cette
 * assertion, elle peut cesser d'être consignée sans qu'aucun test ne bronche —
 * c'est exactement ce qui s'était produit.
 */
Then(
  'le journal de la passe consigne la portée {string}',
  async (ids: string) => {
    const [journal] = await journauxDuCompte()

    assert.deepEqual(journal?.organisationIds, ids.split(',').map(Number))
  },
)

Then('le journal de la passe consigne une portée complète', async () => {
  const [journal] = await journauxDuCompte()

  // Liste vide = toutes les organisations. `passePour` a déjà écarté le cas
  // d'une portée explicitement vide, qui n'ouvre aucun journal.
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
