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
import type { ReconcilierOrganisations, ReconcilierRdvs } from './domain/ports'
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

const MEDIATEUR_ID = MediateurId('b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b')

const ORGANISATIONS_DU_COMPTE = [OrganisationId(101), OrganisationId(102)]

const unChangement = { ...bilanVide, updated: 1 }

const indisponible = ApiIndisponible(503, 'service indisponible')

const organisationsRecues = (
  organisationIds: readonly OrganisationId[],
): Awaited<ReturnType<ReconcilierOrganisations>> =>
  success({ bilan: unChangement, organisationIdsRecues: organisationIds })

const rdvsReconcilies = (
  organisationIdsInaccessibles: readonly OrganisationId[],
): Awaited<ReturnType<ReconcilierRdvs>> =>
  success({
    rdvs: unChangement,
    usagers: unChangement,
    motifs: bilanVide,
    lieux: bilanVide,
    organisationIdsInaccessibles,
    rapprochements: [],
  })

type Etat = {
  organisations: Awaited<ReturnType<ReconcilierOrganisations>>
  rdvs: Awaited<ReturnType<ReconcilierRdvs>>
  lectureDesWebhooksEchoue: boolean
  resultat: CompteSynchronise | undefined
  echoue: boolean
}

const etatInitial: Etat = {
  organisations: organisationsRecues(ORGANISATIONS_DU_COMPTE),
  rdvs: rdvsReconcilies([]),
  lectureDesWebhooksEchoue: false,
  resultat: undefined,
  echoue: false,
}

const etat: Etat = { ...etatInitial }

const synchroniser = synchroniserCompteRdv({
  reconcilierOrganisations: async () => etat.organisations,
  reconcilierRdvs: async () => etat.rdvs,
  listerWebhooksDeLaCoop: async (_compte, organisationId) =>
    etat.lectureDesWebhooksEchoue
      ? failure(indisponible)
      : success([
          {
            id: WebhookId(1),
            organisationId,
            abonnements: abonnementsDeLaCoop,
          },
        ]),
  poserWebhook: async () => failure(indisponible),
  relireWebhooksDeLaCoop: async () => success([]),
  reconfigurerWebhook: async () => failure(indisponible),
  destinationDesWebhooksJoignable: () => false,
  noterLesWebhooksInvalides: async () => success(undefined),
  detacherOrganisations: async () => success(undefined),
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

  return { ...compte, organisationIds: ORGANISATIONS_DU_COMPTE }
}

const synchroniserSur = async (portee: PorteeDeSynchronisation) => {
  const reponse = await synchroniser({
    compte: await compteUtilisable(),
    mediateurId: MEDIATEUR_ID,
    portee,
    maintenant: MAINTENANT,
  })

  etat.echoue = !reponse.success
  etat.resultat = reponse.success ? reponse.data : undefined
}

const passeSynchronisee = () => {
  const { resultat } = etat
  assert.ok(resultat?._tag === 'synchronise', 'La passe n’a pas eu lieu')
  return resultat
}

const organisations = (ids: string): readonly OrganisationId[] =>
  ids.split(',').map((id) => OrganisationId(Number(id)))

const journauxDuCompte = async () =>
  prismaClient.rdvSyncLog.findMany({
    where: { rdvAccountId: AGENT_ID },
    select: {
      started: true,
      ended: true,
      error: true,
      log: true,
      organisationIds: true,
    },
  })

const lignesDuJournal = async (): Promise<readonly string[]> => {
  const journaux = await journauxDuCompte()

  assert.equal(journaux.length, 1, 'Un seul journal attendu')

  return (journaux[0]?.log ?? '').split('\n')
}

Given('un compte RDV à réconcilier', async () => {
  Object.assign(etat, etatInitial)
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given('la réconciliation des organisations échoue', () => {
  etat.organisations = failure(indisponible)
})

Given('la réconciliation des rendez-vous échoue', () => {
  etat.rdvs = failure(indisponible)
})

Given('la réconciliation des rendez-vous lève une exception', () => {
  etat.rdvs = failure(EchecTechnique('la réconciliation a levé'))
})

Given(
  'RDV Service Public ne renvoie que les organisations {string}',
  (ids: string) => {
    etat.organisations = organisationsRecues(organisations(ids))
  },
)

Given(
  'l’organisation {string} refuse l’accès à ses rendez-vous',
  (id: string) => {
    etat.rdvs = rdvsReconcilies(organisations(id))
  },
)

Given('la lecture des webhooks échoue', () => {
  etat.lectureDesWebhooksEchoue = true
})

When('je synchronise tout le compte', async () => {
  await synchroniserSur(toutesOrganisations)
})

When('je synchronise une portée vide', async () => {
  await synchroniserSur(organisationsCiblees([]))
})

When('je synchronise les organisations {string}', async (ids: string) => {
  await synchroniserSur(organisationsCiblees(organisations(ids)))
})

Then('la passe est sans objet', () => {
  assert.equal(etat.resultat?._tag, 'sansObjet')
})

Then('la passe de synchronisation échoue', () => {
  assert.ok(etat.echoue, 'La synchronisation aurait dû échouer')
})

Then('la passe rend une dérive de {int}', (attendue: number) => {
  assert.equal(etat.resultat?.derive, attendue)
})

Then(
  'la passe signale les organisations sans webhook {string}',
  (ids: string) => {
    assert.deepEqual(passeSynchronisee().organisationsSansWebhook, {
      _tag: 'relevees',
      organisationIds: organisations(ids),
    })
  },
)

Then('la passe a détaché les organisations {string}', (ids: string) => {
  assert.deepEqual(
    passeSynchronisee().organisationIdsDetachees,
    organisations(ids),
  )
})

Then('la passe n’a détaché aucune organisation', () => {
  assert.deepEqual(passeSynchronisee().organisationIdsDetachees, [])
})

Then(
  'la passe a réconcilié les webhooks des organisations {string}',
  (ids: string) => {
    assert.deepEqual(
      passeSynchronisee().webhooks.map(({ organisationId }) => organisationId),
      organisations(ids),
    )
  },
)

Then('le journal de la passe retrace {string}', async (ligne: string) => {
  assert.ok(
    (await lignesDuJournal()).includes(ligne),
    `Le journal ne retrace pas « ${ligne} »`,
  )
})

Then('le journal de la passe s’arrête sur {string}', async (ligne: string) => {
  assert.equal((await lignesDuJournal()).at(-1), ligne)
})

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
