import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { EchecTechnique, failure, success } from '@/libraries/result'
import { bilanVide } from '../../domain/compte/bilan-synchronisation'
import { estUtilisable } from '../../domain/compte/compte-rdv'
import { ApiIndisponible } from '../../domain/errors'
import { MediateurId } from '../../domain/identifiants/mediateur-id'
import { OrganisationId } from '../../domain/identifiants/organisation-id'
import {
  organisationsCiblees,
  type PorteeDeSynchronisation,
  toutesOrganisations,
} from '../../domain/portee-de-synchronisation'
import { abonnementsDeLaCoop, WebhookId } from '../../domain/webhook/webhook'
import { compteRdvToDomain } from '../../implementations/prisma/compte-rdv.transfer'
import { compteRdvEnBase, ID_TEST, seedCompteRdv } from '../../rdvsp.cucumber'
import {
  type CompteSynchronise,
  synchroniserCompteRdv,
} from './domain/synchroniser-compte-rdv'
import {
  cloturerJournal,
  echouerJournal,
  ouvrirJournal,
} from './implementations/prisma/journal-synchronisation.mutation'

const AGENT_ID = ID_TEST.compte + 8

const MAINTENANT = new Date('2026-09-01T10:00:00.000Z')

type Etat = {
  appels: readonly string[]
  echecs: readonly string[]
  exceptions: readonly string[]
  organisationsRecues: readonly number[]
  organisationsRefusees: readonly number[]
  organisationsDetachees: readonly number[]
  organisationsSansWebhook: readonly number[]
  webhooksVises: readonly {
    readonly organisationsDuCompte: readonly number[]
    readonly organisation: number
  }[]
  porteeRecueParLesRdvs: PorteeDeSynchronisation | undefined
  resultat: CompteSynchronise | undefined
  echoue: boolean
}

const etatInitial: Etat = {
  appels: [],
  echecs: [],
  exceptions: [],
  organisationsRecues: [],
  organisationsRefusees: [],
  organisationsDetachees: [],
  organisationsSansWebhook: [],
  webhooksVises: [],
  porteeRecueParLesRdvs: undefined,
  resultat: undefined,
  echoue: false,
}

const etat: Etat = { ...etatInitial }

const reinitialiser = () => {
  Object.assign(etat, etatInitial)
}

const appeler = (etape: string) => {
  etat.appels = [...etat.appels, etape]
}

const unChangement = { ...bilanVide, updated: 1 }

const MEDIATEUR_ID = MediateurId('b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b')

const ORGANISATIONS_DU_COMPTE = [101, 102]

const synchroniser = synchroniserCompteRdv({
  reconcilierOrganisations: async () => {
    appeler('organisations')

    return etat.echecs.includes('organisations')
      ? failure(ApiIndisponible(503, 'service indisponible'))
      : success({
          bilan: unChangement,
          organisationIdsRecues: (etat.organisationsRecues.length > 0
            ? etat.organisationsRecues
            : ORGANISATIONS_DU_COMPTE
          ).map((id) => OrganisationId(id)),
        })
  },
  reconcilierRdvs: async ({ portee }) => {
    appeler('rendez-vous')
    etat.porteeRecueParLesRdvs = portee

    if (etat.exceptions.includes('rendez-vous')) {
      return failure(EchecTechnique('la réconciliation a levé'))
    }

    return etat.echecs.includes('rendez-vous')
      ? failure(ApiIndisponible(503, 'service indisponible'))
      : success({
          rdvs: unChangement,
          usagers: unChangement,
          motifs: bilanVide,
          lieux: bilanVide,
          organisationIdsInaccessibles: (portee._tag === 'organisations'
            ? portee.organisationIds
            : []
          )
            .filter((id) => etat.organisationsRefusees.includes(id))
            .map((id) => OrganisationId(id)),
          rapprochements: [],
        })
  },
  listerWebhooksDeLaCoop: async (compte, organisationId) => {
    if (etat.appels.at(-1) !== 'webhooks') appeler('webhooks')
    etat.webhooksVises = [
      ...etat.webhooksVises,
      {
        organisationsDuCompte: compte.organisationIds,
        organisation: organisationId,
      },
    ]

    return etat.organisationsSansWebhook.includes(organisationId)
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
    etat.organisationsDetachees = [
      ...etat.organisationsDetachees,
      ...organisationIds,
    ]
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
      started: true,
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
  etat.echecs = [...etat.echecs, 'organisations']
})

Given('la réconciliation des rendez-vous échoue', () => {
  etat.echecs = [...etat.echecs, 'rendez-vous']
})

Given(
  'RDV Service Public ne renvoie que les organisations {string}',
  (ids: string) => {
    etat.organisationsRecues = ids.split(',').map(Number)
  },
)

Given(
  'l’organisation {string} refuse l’accès à ses rendez-vous',
  (id: string) => {
    etat.organisationsRefusees = [...etat.organisationsRefusees, Number(id)]
  },
)

Given('la réconciliation des rendez-vous lève une exception', () => {
  etat.exceptions = [...etat.exceptions, 'rendez-vous']
})

Given(
  'la pose de webhook échoue sur l’organisation {string}',
  (ids: string) => {
    etat.organisationsSansWebhook = ids.split(',').map(Number)
  },
)

When('je synchronise tout le compte', async () => {
  const reponse = await synchroniser({
    compte: await compteUtilisable(),
    mediateurId: MEDIATEUR_ID,
    portee: toutesOrganisations,
    maintenant: MAINTENANT,
  })

  etat.echoue = !reponse.success
  etat.resultat = reponse.success ? reponse.data : undefined
})

When('je synchronise tout le compte en rattrapant l’exception', async () => {
  const reponse = await synchroniser({
    compte: await compteUtilisable(),
    mediateurId: MEDIATEUR_ID,
    portee: toutesOrganisations,
    maintenant: MAINTENANT,
  })

  etat.echoue = !reponse.success
})

When('je synchronise une portée vide', async () => {
  const reponse = await synchroniser({
    compte: await compteUtilisable(),
    mediateurId: MEDIATEUR_ID,
    portee: organisationsCiblees([]),
    maintenant: MAINTENANT,
  })

  etat.echoue = !reponse.success
  etat.resultat = reponse.success ? reponse.data : undefined
})

When('je synchronise les organisations {string}', async (ids: string) => {
  const reponse = await synchroniser({
    compte: await compteUtilisable(),
    mediateurId: MEDIATEUR_ID,
    portee: organisationsCiblees(
      ids.split(',').map((id) => OrganisationId(Number(id))),
    ),
    maintenant: MAINTENANT,
  })

  etat.echoue = !reponse.success
  etat.resultat = reponse.success ? reponse.data : undefined
})

Then(
  'les réconciliations se sont enchaînées dans l’ordre {string}',
  (attendu: string) => {
    assert.deepEqual(etat.appels, attendu.split(','))
  },
)

Then('aucune réconciliation n’a été lancée', () => {
  assert.deepEqual(etat.appels, [])
})

Then('la passe de synchronisation échoue', () => {
  assert.ok(etat.echoue, 'La synchronisation aurait dû échouer')
})

Then('la passe rend une dérive de {int}', (attendue: number) => {
  assert.equal(etat.resultat?.derive, attendue)
})

Then(
  'les rendez-vous ont été réconciliés sur les organisations {string}',
  (ids: string) => {
    assert.deepEqual(etat.porteeRecueParLesRdvs, {
      _tag: 'organisations',
      organisationIds: ids.split(',').map(Number),
    })
  },
)

Then(
  'la passe signale les organisations sans webhook {string}',
  (ids: string) => {
    const { resultat } = etat
    assert.ok(resultat?._tag === 'synchronise', 'La passe n’a pas eu lieu')
    assert.deepEqual(resultat.organisationsSansWebhook, {
      _tag: 'relevees',
      organisationIds: ids.split(',').map(Number),
    })
  },
)

Then(
  'les organisations {string} ont été détachées du compte',
  (ids: string) => {
    assert.deepEqual(etat.organisationsDetachees, ids.split(',').map(Number))
  },
)

Then('aucune organisation n’a été détachée du compte', () => {
  assert.deepEqual(etat.organisationsDetachees, [])
})

Then(
  'les webhooks ont été réconciliés sur les organisations {string}',
  (ids: string) => {
    assert.deepEqual(
      etat.webhooksVises.map(({ organisation }) => organisation),
      ids.split(',').map(Number),
    )
  },
)

Then(
  'les webhooks ont visé les seules organisations reçues {string}',
  (ids: string) => {
    assert.deepEqual(
      etat.webhooksVises[0]?.organisationsDuCompte.map(Number),
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

Then('le journal de la passe s’ouvre à l’instant de la passe', async () => {
  const [journal] = await journauxDuCompte()

  assert.deepEqual(journal?.started, MAINTENANT)
})

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
