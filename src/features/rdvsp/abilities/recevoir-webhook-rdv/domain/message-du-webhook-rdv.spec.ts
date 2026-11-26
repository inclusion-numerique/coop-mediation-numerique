import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import { PayloadInexploitable } from '../../../domain/errors'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../domain/identifiants/rdv-id'
import { RdvUuid } from '../../../domain/identifiants/rdv-uuid'
import { DureeEnMinutes } from '../../../domain/rdv/duree-en-minutes'
import type { Rdv } from '../../../domain/rdv/rdv'
import { StatutPresence } from '../../../domain/rdv/statut-presence'
import { UrlAgent } from '../../../domain/url-agent'
import { AucunAgent, type EchecDeRecevoirWebhookRdv } from './errors'
import { messageDuWebhookRdv } from './message-du-webhook-rdv'
import type { WebhookRdvTraite } from './recevoir-webhook-rdv'

const rdv: Rdv = {
  id: RdvId(1),
  uuid: RdvUuid('0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b'),
  agentId: RdvAgentId(4242),
  organisationId: OrganisationId(7),
  adresse: null,
  debut: new Date('2026-09-01T09:00:00.000Z'),
  fin: new Date('2026-09-01T10:00:00.000Z'),
  duree: DureeEnMinutes(60),
  statutPresence: StatutPresence('unknown'),
  urlAgent: UrlAgent('https://rdv.anct.gouv.fr/admin/rdvs/1'),
  nombreParticipants: 0,
  contexte: null,
  creeParId: null,
  annulation: null,
  motif: null,
  lieu: null,
  collectif: false,
  participations: [],
}

const demande = {
  usagers: [],
  mediateurId: 'b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b',
}

describe('message du webhook rendez-vous', () => {
  it.each<{
    cas: string
    resultat: Result<WebhookRdvTraite, EchecDeRecevoirWebhookRdv>
    message: string
  }>([
    {
      cas: 'dit ce qui est arrivé au rendez-vous traité',
      resultat: success({ _tag: 'supprime', rdvId: RdvId(1) }),
      message: 'rendez-vous supprime',
    },
    {
      cas: 'dit que le rendez-vous est enregistré et ses bénéficiaires rapprochés',
      resultat: success({
        _tag: 'enregistre',
        rdv,
        rapprochement: { _tag: 'reussi', ...demande, ecartes: 0 },
      }),
      message: 'rendez-vous enregistre',
    },
    {
      cas: 'signale un rapprochement échoué, sans en faire un échec',
      resultat: success({
        _tag: 'enregistre',
        rdv,
        rapprochement: {
          _tag: 'echoue',
          usagerIds: [],
          mediateurId: demande.mediateurId,
          message: 'adresse illisible',
        },
      }),
      message:
        'rendez-vous enregistre, merge bénéficiaires échoué (non bloquant) : adresse illisible',
    },
    {
      cas: 'dit pourquoi la notification est ignorée',
      resultat: success({ _tag: 'ignore', raison: 'compteInconnu' }),
      message: 'notification ignorée : compteInconnu',
    },
    {
      cas: 'dit que le payload n’était pas exploitable',
      resultat: failure(PayloadInexploitable()),
      message: 'notification ignorée : payloadInexploitable',
    },
    {
      cas: 'dit que la notification ne désignait aucun agent',
      resultat: failure(AucunAgent()),
      message: 'notification ignorée : aucunAgent',
    },
  ])('$cas', ({ resultat, message }) => {
    expect(messageDuWebhookRdv(resultat)).toBe(message)
  })
})
