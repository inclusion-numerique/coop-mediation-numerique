import { describe, expect, it } from 'vitest'
import { EchecTechnique, failure, success } from '@/libraries/result'
import {
  bilanSynchronisationVide,
  bilanVide,
} from '../../../domain/compte/bilan-synchronisation'
import type { CompteRdvLie } from '../../../domain/compte/compte-rdv'
import { JetonAcces } from '../../../domain/compte/jetons-oauth'
import { ApiIndisponible } from '../../../domain/errors'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import {
  organisationsCiblees,
  toutesOrganisations,
} from '../../../domain/portee-de-synchronisation'
import type { Rapprochement } from '../../../domain/rapprochement'
import {
  AbonnementWebhook,
  abonnementsDeLaCoop,
  WebhookId,
  type WebhookInstalle,
} from '../../../domain/webhook/webhook'
import type { SynchroniserCompteRdvPorts } from './ports'
import type { PoseDeWebhook } from './poser-les-webhooks'
import type { OrganisationsSansWebhook } from './resultat-synchronisation'
import { synchroniserCompteRdv } from './synchroniser-compte-rdv'

const organisation = OrganisationId(10)
const autreOrganisation = OrganisationId(20)
const mediateurId = MediateurId('b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b')
const maintenant = new Date('2026-09-01T10:00:00.000Z')
const panne = EchecTechnique('connexion perdue')
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

const rapprochementsDuLot: readonly Rapprochement[] = [{ _tag: 'sansObjet' }]

const journalComplet =
  'réconciliation des organisations\norganisations réconciliées\nréconciliation des rendez-vous\nrendez-vous réconciliés\ninstallation des webhooks\nwebhooks installés'

const journalRestreint =
  'organisations non réconciliées (passe restreinte)\norganisations réconciliées\nréconciliation des rendez-vous\nrendez-vous réconciliés\ninstallation des webhooks\nwebhooks installés'

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
      rapprochements: rapprochementsDuLot,
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

const passeComplete = {
  compte,
  mediateurId,
  portee: toutesOrganisations,
  maintenant,
}

const synchronise = ({
  bilan,
  derive,
  organisationsSansWebhook,
  organisationIdsDetachees,
  webhook,
  rapprochements,
  journal,
}: {
  readonly bilan: typeof bilanSynchronisationVide
  readonly derive: number
  readonly organisationsSansWebhook: OrganisationsSansWebhook
  readonly organisationIdsDetachees: readonly OrganisationId[]
  readonly webhook: readonly PoseDeWebhook[]
  readonly rapprochements: readonly Rapprochement[]
  readonly journal: string
}) =>
  success({
    _tag: 'synchronise',
    bilan,
    derive,
    organisationsSansWebhook,
    synchroniseeLe: maintenant,
    organisationIdsDetachees,
    webhooks: webhook,
    rapprochements,
    journal,
  })

const bilanComplet = {
  ...bilanSynchronisationVide,
  organisations: unChangement,
  rdvs: unChangement,
}

const nonRelevees: OrganisationsSansWebhook = { _tag: 'nonRelevees' }

const releves = (
  organisationIds: readonly OrganisationId[],
): OrganisationsSansWebhook => ({ _tag: 'relevees', organisationIds })

const noop = { ...bilanVide, noop: 1 }
const cree = { ...bilanVide, created: 1 }
const reconfigure = { ...bilanVide, updated: 1 }

const poseDuWebhook = (
  issue: PoseDeWebhook['_tag'],
  webhooks: typeof bilanVide,
  derive: number,
  organisationIds: readonly OrganisationId[],
) => ({
  bilan: { ...bilanComplet, webhooks },
  derive,
  organisationsSansWebhook: releves(organisationIds),
  organisationIdsDetachees: [],
  webhook: [{ _tag: issue, organisationId: organisation }],
  rapprochements: rapprochementsDuLot,
  journal: journalComplet,
})

describe('synchroniser un compte RDV', () => {
  it('réconcilie organisations, rendez-vous et webhooks, et rend la dérive de la passe', async () => {
    expect(await synchroniserCompteRdv(ports)(passeComplete)).toEqual(
      synchronise(poseDuWebhook('inchange', noop, 2, [])),
    )
  })

  it('n’a rien à faire pour une portée vide', async () => {
    expect(
      await synchroniserCompteRdv(ports)({
        ...passeComplete,
        portee: organisationsCiblees([]),
      }),
    ).toEqual(
      success({ _tag: 'sansObjet', derive: 0, synchroniseeLe: maintenant }),
    )
  })

  it('ne réconcilie pas les rendez-vous d’un compte sans médiateur', async () => {
    expect(
      await synchroniserCompteRdv(ports)({
        ...passeComplete,
        mediateurId: null,
      }),
    ).toEqual(
      synchronise({
        bilan: {
          ...bilanSynchronisationVide,
          organisations: unChangement,
          webhooks: { ...bilanVide, noop: 1 },
        },
        derive: 1,
        organisationsSansWebhook: releves([]),
        organisationIdsDetachees: [],
        webhook: [{ _tag: 'inchange', organisationId: organisation }],
        rapprochements: [],
        journal: journalComplet,
      }),
    )
  })

  it('ne réconcilie pas les organisations sur une passe restreinte, ni ne note les webhooks manquants', async () => {
    expect(
      await synchroniserCompteRdv(ports)({
        ...passeComplete,
        portee: organisationsCiblees([organisation]),
      }),
    ).toEqual(
      synchronise({
        bilan: {
          ...bilanSynchronisationVide,
          rdvs: unChangement,
          webhooks: { ...bilanVide, noop: 1 },
        },
        derive: 1,
        organisationsSansWebhook: nonRelevees,
        organisationIdsDetachees: [],
        webhook: [{ _tag: 'inchange', organisationId: organisation }],
        rapprochements: rapprochementsDuLot,
        journal: journalRestreint,
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
            rapprochements: rapprochementsDuLot,
          }),
      })({
        ...passeComplete,
        portee: organisationsCiblees([organisation, autreOrganisation]),
      }),
    ).toEqual(
      synchronise({
        bilan: {
          ...bilanSynchronisationVide,
          rdvs: unChangement,
          webhooks: { ...bilanVide, noop: 1 },
        },
        derive: 1,
        organisationsSansWebhook: nonRelevees,
        organisationIdsDetachees: [autreOrganisation],
        webhook: [{ _tag: 'inchange', organisationId: organisation }],
        rapprochements: rapprochementsDuLot,
        journal:
          'organisations non réconciliées (passe restreinte)\norganisations réconciliées\nréconciliation des rendez-vous\nrendez-vous réconciliés\norganisations inaccessibles détachées : 20\ninstallation des webhooks\nwebhooks installés',
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
      attendu: poseDuWebhook('manquant', noop, 2, [organisation]),
    },
    {
      cas: 'reconfigure un webhook dont les abonnements ont changé',
      ports: { listerWebhooksDeLaCoop: async () => success([webhookPerime]) },
      attendu: poseDuWebhook('reconfigure', reconfigure, 3, []),
    },
    {
      cas: 'tient pour manquant un webhook que la reconfiguration n’a pas atteint',
      ports: {
        listerWebhooksDeLaCoop: async () => success([webhookPerime]),
        reconfigurerWebhook: async () => failure(indisponible),
      },
      attendu: poseDuWebhook('manquant', noop, 2, [organisation]),
    },
    {
      cas: 'ne pose rien quand la destination n’est pas joignable',
      ports: {
        listerWebhooksDeLaCoop: async () => success([]),
        destinationDesWebhooksJoignable: () => false,
      },
      attendu: poseDuWebhook('inchange', noop, 2, []),
    },
    {
      cas: 'tient pour manquant un webhook dont la pose échoue',
      ports: {
        listerWebhooksDeLaCoop: async () => success([]),
        poserWebhook: async () => failure(indisponible),
      },
      attendu: poseDuWebhook('manquant', noop, 2, [organisation]),
    },
    {
      cas: 'pose le webhook manquant et le retrouve à la relecture',
      ports: { listerWebhooksDeLaCoop: async () => success([]) },
      attendu: poseDuWebhook('cree', cree, 3, []),
    },
    {
      cas: 'tient pour manquant un webhook posé que la relecture ne retrouve pas',
      ports: {
        listerWebhooksDeLaCoop: async () => success([]),
        relireWebhooksDeLaCoop: async () => success([]),
      },
      attendu: poseDuWebhook('manquant', noop, 2, [organisation]),
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
            rapprochements: rapprochementsDuLot,
          }),
        detacherOrganisations: async () => failure(panne),
      })(passeComplete),
    ).toEqual(failure(panne))
  })
})
