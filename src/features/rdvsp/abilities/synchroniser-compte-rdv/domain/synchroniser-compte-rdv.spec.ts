import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import {
  bilanSynchronisationVide,
  bilanVide,
} from '../../../domain/compte/bilan-synchronisation'
import type { CompteRdvLie } from '../../../domain/compte/compte-rdv'
import { JetonAcces } from '../../../domain/compte/jetons-oauth'
import { ApiIndisponible, ErreurTechnique } from '../../../domain/errors'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import {
  AbonnementWebhook,
  abonnementsDeLaCoop,
  WebhookId,
  type WebhookInstalle,
} from '../../../domain/webhook/webhook'
import type { SynchroniserCompteRdvPorts } from './ports'
import { synchroniserCompteRdv } from './synchroniser-compte-rdv'

const organisation = OrganisationId(10)
const autreOrganisation = OrganisationId(20)
const mediateurId = 'b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b'
const panne = ErreurTechnique(new Error('connexion perdue'))
const indisponible = ApiIndisponible(503, 'maintenance')

const compte: CompteRdvLie = {
  _tag: 'lie',
  agentId: RdvAgentId(4242),
  utilisateurId: UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c'),
  organisationIds: [organisation],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
  jetons: {
    acces: JetonAcces('jeton-acces'),
    rafraichissement: null,
    expiration: null,
    portee: null,
  },
}

const webhookAJour: WebhookInstalle = {
  id: WebhookId(1),
  organisationId: organisation,
  abonnements: abonnementsDeLaCoop,
}

const webhookPerime: WebhookInstalle = {
  ...webhookAJour,
  abonnements: [AbonnementWebhook('rdv')],
}

const unChangement = { ...bilanVide, updated: 1 }

const ports: SynchroniserCompteRdvPorts = {
  reconcilierOrganisations: async () =>
    success({ bilan: unChangement, organisationIdsRecues: [organisation] }),
  reconcilierRdvs: async () =>
    success({
      rdvs: unChangement,
      usagers: bilanVide,
      motifs: bilanVide,
      lieux: bilanVide,
      organisationIdsInaccessibles: [],
    }),
  listerWebhooksDeLaCoop: async () => success([webhookAJour]),
  poserWebhook: async () => success(webhookAJour),
  relireWebhooksDeLaCoop: async () => success([webhookAJour]),
  reconfigurerWebhook: async () => success(webhookAJour),
  destinationDesWebhooksJoignable: () => true,
  noterLesWebhooksInvalides: async () => success(undefined),
  detacherOrganisations: async () => success(undefined),
  ouvrirJournal: async () => success({ journalId: 'journal' }),
  cloturerJournal: async () => success(undefined),
  echouerJournal: async () => success(undefined),
  noterLaSynchronisationReussie: async () => success(undefined),
}

const passeComplete = { compte, mediateurId }

const synchronise = ({
  bilan,
  derive,
  organisationIdsSansWebhook,
  organisationIdsDetachees,
  webhook,
}: {
  readonly bilan: typeof bilanSynchronisationVide
  readonly derive: number
  readonly organisationIdsSansWebhook: readonly OrganisationId[] | undefined
  readonly organisationIdsDetachees: readonly OrganisationId[]
  readonly webhook: readonly {
    readonly organisationId: OrganisationId
    readonly operation: 'noop' | 'created' | 'updated'
    readonly invalide: boolean
  }[]
}) =>
  success({
    bilan,
    derive,
    organisationIdsSansWebhook,
    organisationIdsDetachees,
    webhooks: webhook,
  })

const bilanComplet = {
  ...bilanSynchronisationVide,
  organisations: unChangement,
  rdvs: unChangement,
}

const noop = { ...bilanVide, noop: 1 }
const cree = { ...bilanVide, created: 1 }
const reconfigure = { ...bilanVide, updated: 1 }

const poseDuWebhook = (
  operation: 'noop' | 'created' | 'updated',
  webhooks: typeof bilanVide,
  derive: number,
  organisationIdsSansWebhook: readonly OrganisationId[],
  invalide: boolean,
) => ({
  bilan: { ...bilanComplet, webhooks },
  derive,
  organisationIdsSansWebhook,
  organisationIdsDetachees: [],
  webhook: [
    {
      organisationId: organisation,
      operation,
      invalide,
    },
  ],
})

describe('synchroniser un compte RDV', () => {
  it('réconcilie organisations, rendez-vous et webhooks, et rend la dérive de la passe', async () => {
    expect(await synchroniserCompteRdv(ports)(passeComplete)).toEqual(
      synchronise(poseDuWebhook('noop', noop, 2, [], false)),
    )
  })

  it('n’a rien à faire pour une portée vide', async () => {
    expect(
      await synchroniserCompteRdv(ports)({
        ...passeComplete,
        organisationIds: [],
      }),
    ).toEqual(
      synchronise({
        bilan: bilanSynchronisationVide,
        derive: 0,
        organisationIdsSansWebhook: undefined,
        organisationIdsDetachees: [],
        webhook: [],
      }),
    )
  })

  it('ne réconcilie pas les rendez-vous d’un compte sans médiateur', async () => {
    expect(
      await synchroniserCompteRdv(ports)({ compte, mediateurId: null }),
    ).toEqual(
      synchronise({
        bilan: {
          ...bilanSynchronisationVide,
          organisations: unChangement,
          webhooks: { ...bilanVide, noop: 1 },
        },
        derive: 1,
        organisationIdsSansWebhook: [],
        organisationIdsDetachees: [],
        webhook: [
          { organisationId: organisation, operation: 'noop', invalide: false },
        ],
      }),
    )
  })

  it('ne réconcilie pas les organisations sur une passe restreinte, ni ne note les webhooks manquants', async () => {
    expect(
      await synchroniserCompteRdv(ports)({
        ...passeComplete,
        organisationIds: [organisation],
      }),
    ).toEqual(
      synchronise({
        bilan: {
          ...bilanSynchronisationVide,
          rdvs: unChangement,
          webhooks: { ...bilanVide, noop: 1 },
        },
        derive: 1,
        organisationIdsSansWebhook: undefined,
        organisationIdsDetachees: [],
        webhook: [
          { organisationId: organisation, operation: 'noop', invalide: false },
        ],
      }),
    )
  })

  it('détache les organisations devenues inaccessibles et n’y pose aucun webhook', async () => {
    expect(
      await synchroniserCompteRdv({
        ...ports,
        reconcilierRdvs: async () =>
          success({
            rdvs: unChangement,
            usagers: bilanVide,
            motifs: bilanVide,
            lieux: bilanVide,
            organisationIdsInaccessibles: [autreOrganisation],
          }),
      })({
        ...passeComplete,
        organisationIds: [organisation, autreOrganisation],
      }),
    ).toEqual(
      synchronise({
        bilan: {
          ...bilanSynchronisationVide,
          rdvs: unChangement,
          webhooks: { ...bilanVide, noop: 1 },
        },
        derive: 1,
        organisationIdsSansWebhook: undefined,
        organisationIdsDetachees: [autreOrganisation],
        webhook: [
          { organisationId: organisation, operation: 'noop', invalide: false },
        ],
      }),
    )
  })

  it.each<{
    cas: string
    ports: Partial<SynchroniserCompteRdvPorts>
    attendu: ReturnType<typeof poseDuWebhook>
  }>([
    {
      cas: 'tient pour manquant le webhook d’une organisation illisible',
      ports: { listerWebhooksDeLaCoop: async () => failure(indisponible) },
      attendu: poseDuWebhook('noop', noop, 2, [organisation], true),
    },
    {
      cas: 'reconfigure un webhook dont les abonnements ont changé',
      ports: { listerWebhooksDeLaCoop: async () => success([webhookPerime]) },
      attendu: poseDuWebhook('updated', reconfigure, 3, [], false),
    },
    {
      cas: 'tient pour manquant un webhook que la reconfiguration n’a pas atteint',
      ports: {
        listerWebhooksDeLaCoop: async () => success([webhookPerime]),
        reconfigurerWebhook: async () => failure(indisponible),
      },
      attendu: poseDuWebhook('noop', noop, 2, [organisation], true),
    },
    {
      cas: 'ne pose rien quand la destination n’est pas joignable',
      ports: {
        listerWebhooksDeLaCoop: async () => success([]),
        destinationDesWebhooksJoignable: () => false,
      },
      attendu: poseDuWebhook('noop', noop, 2, [], false),
    },
    {
      cas: 'tient pour manquant un webhook dont la pose échoue',
      ports: {
        listerWebhooksDeLaCoop: async () => success([]),
        poserWebhook: async () => failure(indisponible),
      },
      attendu: poseDuWebhook('noop', noop, 2, [organisation], true),
    },
    {
      cas: 'pose le webhook manquant et le retrouve à la relecture',
      ports: { listerWebhooksDeLaCoop: async () => success([]) },
      attendu: poseDuWebhook('created', cree, 3, [], false),
    },
    {
      cas: 'tient pour manquant un webhook posé que la relecture ne retrouve pas',
      ports: {
        listerWebhooksDeLaCoop: async () => success([]),
        relireWebhooksDeLaCoop: async () => success([]),
      },
      attendu: poseDuWebhook('noop', noop, 2, [organisation], true),
    },
  ])('$cas', async ({ ports: surcharge, attendu }) => {
    expect(
      await synchroniserCompteRdv({ ...ports, ...surcharge })(passeComplete),
    ).toEqual(synchronise(attendu))
  })

  it.each<{ cas: string; ports: Partial<SynchroniserCompteRdvPorts> }>([
    {
      cas: 'l’ouverture du journal',
      ports: { ouvrirJournal: async () => failure(panne) },
    },
    {
      cas: 'la réconciliation des organisations',
      ports: { reconcilierOrganisations: async () => failure(panne) },
    },
    {
      cas: 'la réconciliation des rendez-vous',
      ports: { reconcilierRdvs: async () => failure(panne) },
    },
    {
      cas: 'la note des webhooks manquants',
      ports: { noterLesWebhooksInvalides: async () => failure(panne) },
    },
    {
      cas: 'la clôture du journal',
      ports: { cloturerJournal: async () => failure(panne) },
    },
    {
      cas: 'la note de la synchronisation réussie',
      ports: { noterLaSynchronisationReussie: async () => failure(panne) },
    },
    {
      cas: 'la consignation de l’échec au journal',
      ports: {
        reconcilierRdvs: async () => failure(indisponible),
        echouerJournal: async () => failure(panne),
      },
    },
  ])('rend l’échec de $cas', async ({ ports: surcharge }) => {
    expect(
      await synchroniserCompteRdv({ ...ports, ...surcharge })(passeComplete),
    ).toEqual(failure(panne))
  })

  it('rend l’échec du détachement des organisations inaccessibles', async () => {
    expect(
      await synchroniserCompteRdv({
        ...ports,
        reconcilierRdvs: async () =>
          success({
            rdvs: bilanVide,
            usagers: bilanVide,
            motifs: bilanVide,
            lieux: bilanVide,
            organisationIdsInaccessibles: [autreOrganisation],
          }),
        detacherOrganisations: async () => failure(panne),
      })(passeComplete),
    ).toEqual(failure(panne))
  })
})
