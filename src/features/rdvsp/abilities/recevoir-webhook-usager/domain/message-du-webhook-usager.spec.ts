import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import { PayloadInexploitable } from '../../../domain/errors'
import { UsagerId } from '../../../domain/identifiants/usager-id'
import type { EchecDeRecevoirWebhookUsager } from './errors'
import { messageDuWebhookUsager } from './message-du-webhook-usager'
import type { WebhookUsagerTraite } from './webhook-usager-traite'

describe('message du webhook usager', () => {
  it.each<{
    cas: string
    resultat: Result<WebhookUsagerTraite, EchecDeRecevoirWebhookUsager>
    message: string
  }>([
    {
      cas: 'dit ce qui est arrivé à l’usager traité',
      resultat: success({
        _tag: 'anonymiseEtSupprime',
        usagerId: UsagerId(200),
        beneficiaires: [],
        anonymiseLe: new Date('2026-09-01T10:00:00.000Z'),
      }),
      message: 'usager anonymiseEtSupprime',
    },
    {
      cas: 'dit pourquoi la notification est ignorée',
      resultat: success({ _tag: 'ignore', raison: 'creationDeferee' }),
      message: 'notification usager ignorée : creationDeferee',
    },
    {
      cas: 'dit que le payload n’était pas exploitable',
      resultat: failure(PayloadInexploitable()),
      message: 'notification usager ignorée : payloadInexploitable',
    },
  ])('$cas', ({ resultat, message }) => {
    expect(messageDuWebhookUsager(resultat)).toBe(message)
  })
})
