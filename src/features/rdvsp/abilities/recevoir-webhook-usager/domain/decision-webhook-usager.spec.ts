import { describe, expect, it } from 'vitest'
import { EvenementWebhook } from '../../../domain/webhook/evenement-webhook'
import {
  type BeneficiaireLie,
  decisionPourWebhookUsager,
} from './decision-webhook-usager'

const beneficiaire = (id: string): BeneficiaireLie => ({ id })

describe('decisionPourWebhookUsager', () => {
  it('diffère toute création — un usager sans rendez-vous n’a pas de médiateur', () => {
    const decision = decisionPourWebhookUsager({
      evenement: EvenementWebhook('created'),
      beneficiairesLies: [],
    })

    expect(decision).toEqual({ _tag: 'ignorer', raison: 'creationDeferee' })
  })

  it('diffère la création même si un bénéficiaire est déjà rattaché', () => {
    const decision = decisionPourWebhookUsager({
      evenement: EvenementWebhook('created'),
      beneficiairesLies: [beneficiaire('b1')],
    })

    expect(decision._tag).toBe('ignorer')
  })

  it('met à jour un usager rattaché à un bénéficiaire', () => {
    const decision = decisionPourWebhookUsager({
      evenement: EvenementWebhook('updated'),
      beneficiairesLies: [beneficiaire('b1')],
    })

    expect(decision._tag).toBe('mettreAJour')
  })

  it('ignore la mise à jour d’un usager que La Coop ne suit pas', () => {
    const decision = decisionPourWebhookUsager({
      evenement: EvenementWebhook('updated'),
      beneficiairesLies: [],
    })

    expect(decision).toEqual({ _tag: 'ignorer', raison: 'usagerNonSuivi' })
  })

  it('applique une suppression, même sans bénéficiaire rattaché', () => {
    const decision = decisionPourWebhookUsager({
      evenement: EvenementWebhook('destroyed'),
      beneficiairesLies: [],
    })

    expect(decision._tag).toBe('anonymiserEtSupprimer')
  })
})
