import assert from 'node:assert'
import { failure, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { compteRdvToDomain } from '../../db/compte-rdv.transfer'
import { bilanVide } from '../../domain/bilan-synchronisation'
import { estUtilisable } from '../../domain/compte-rdv'
import { ApiIndisponible } from '../../domain/errors'
import { OrganisationId } from '../../domain/organisation-id'
import { compteRdvEnBase, ID_TEST, seedCompteRdv } from '../../rdvsp.cucumber'
import type {
  ResultatSynchronisation,
  SynchroniserCompteRdv,
} from './domain/synchroniser-compte-rdv'
import {
  cloturerJournal,
  echouerJournal,
  ouvrirJournal,
} from './implementation/prisma/journal-synchronisation.prisma'
import { synchroniserCompteRdv } from './implementation/synchroniser-compte-rdv'

const AGENT_ID = ID_TEST.compte + 8

/** Ordre d'appel observé, seule façon de constater l'enchaînement du dehors. */
const appels: string[] = []

const echecs = new Set<string>()
const exceptions = new Set<string>()
let organisationIdsRecusParLesRdvs: readonly number[] | undefined
let organisationsSansWebhook: readonly number[] | undefined
let resultat: ResultatSynchronisation | undefined
let echoue = false

const reinitialiser = () => {
  appels.length = 0
  echecs.clear()
  exceptions.clear()
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

const synchroniser: SynchroniserCompteRdv = synchroniserCompteRdv({
  reconcilierOrganisations: async () => {
    appels.push('organisations')

    return echecs.has('organisations')
      ? failure(ApiIndisponible(503, 'service indisponible'))
      : success(unChangement)
  },
  reconcilierRdvs: async ({ organisationIds }) => {
    appels.push('rendez-vous')
    organisationIdsRecusParLesRdvs = organisationIds

    if (exceptions.has('rendez-vous')) {
      throw new Error('la réconciliation a levé')
    }

    return echecs.has('rendez-vous')
      ? failure(ApiIndisponible(503, 'service indisponible'))
      : success({
          rdvs: unChangement,
          usagers: unChangement,
          motifs: bilanVide,
          lieux: bilanVide,
        })
  },
  reconcilierWebhooks: async () => {
    appels.push('webhooks')

    return {
      bilan: bilanVide,
      organisationIdsSansWebhook: organisationsSansWebhook?.map((id) =>
        OrganisationId(id),
      ),
    }
  },
  ouvrirJournal,
  cloturerJournal,
  echouerJournal,
})

const compteUtilisable = async () => {
  const row = await compteRdvEnBase(AGENT_ID)
  assert.ok(row, 'Aucun compte RDV en base')

  const compte = compteRdvToDomain(row)
  assert.ok(estUtilisable(compte), 'Le compte devrait être utilisable')

  return compte
}

const journauxDuCompte = async () =>
  prismaClient.rdvSyncLog.findMany({
    where: { rdvAccountId: AGENT_ID },
    select: { ended: true, error: true, drift: true },
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
  const reponse = await synchroniser({ compte: await compteUtilisable() })

  echoue = !reponse.success
  resultat = reponse.success ? reponse.data : undefined
})

When('je synchronise tout le compte en rattrapant l’exception', async () => {
  await synchroniser({ compte: await compteUtilisable() }).catch(() => {
    echoue = true
  })
})

When('je synchronise une portée vide', async () => {
  const reponse = await synchroniser({
    compte: await compteUtilisable(),
    organisationIds: [],
  })

  echoue = !reponse.success
  resultat = reponse.success ? reponse.data : undefined
})

When('je synchronise les organisations {string}', async (ids: string) => {
  const reponse = await synchroniser({
    compte: await compteUtilisable(),
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

Then('le journal de la passe est clôturé sans erreur', async () => {
  const journaux = await journauxDuCompte()

  assert.equal(journaux.length, 1, 'Un seul journal attendu')
  assert.ok(journaux[0]?.ended, 'Le journal devrait être clôturé')
  assert.equal(journaux[0]?.error, null)
})

Then('le journal de la passe porte une erreur', async () => {
  const journaux = await journauxDuCompte()

  assert.equal(journaux.length, 1, 'Un seul journal attendu')
  assert.ok(journaux[0]?.error, 'Le journal devrait porter une erreur')
})

Then('aucun journal de passe n’a été ouvert', async () => {
  assert.deepEqual(await journauxDuCompte(), [])
})
