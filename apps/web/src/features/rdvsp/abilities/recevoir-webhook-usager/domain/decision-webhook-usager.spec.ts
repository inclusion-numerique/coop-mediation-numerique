import { EvenementWebhook } from '../../../domain/evenement-webhook'
import {
  type BeneficiaireLie,
  decisionPourWebhookUsager,
  perteParMediateur,
} from './decision-webhook-usager'

const beneficiaire = (id: string, mediateurId: string): BeneficiaireLie => ({
  id,
  mediateurId,
})

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
      beneficiairesLies: [beneficiaire('b1', 'm1')],
    })

    expect(decision._tag).toBe('ignorer')
  })

  it('met à jour un usager rattaché à un bénéficiaire', () => {
    const decision = decisionPourWebhookUsager({
      evenement: EvenementWebhook('updated'),
      beneficiairesLies: [beneficiaire('b1', 'm1')],
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

describe('perteParMediateur', () => {
  it('ne compte rien sans bénéficiaire', () => {
    expect([...perteParMediateur([])]).toEqual([])
  })

  it('compte une fiche par médiateur', () => {
    const pertes = perteParMediateur([
      beneficiaire('b1', 'm1'),
      beneficiaire('b2', 'm2'),
    ])

    expect([...pertes]).toEqual([
      ['m1', 1],
      ['m2', 1],
    ])
  })

  it('cumule les fiches d’un même médiateur', () => {
    const pertes = perteParMediateur([
      beneficiaire('b1', 'm1'),
      beneficiaire('b2', 'm1'),
      beneficiaire('b3', 'm2'),
    ])

    expect(pertes.get('m1')).toBe(2)
    expect(pertes.get('m2')).toBe(1)
  })
})
