import { AdresseRdv } from '../../../domain/adresse-rdv'
import { DureeEnMinutes } from '../../../domain/duree-en-minutes'
import { OrganisationId } from '../../../domain/organisation-id'
import type { Rdv } from '../../../domain/rdv'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { RdvId } from '../../../domain/rdv-id'
import { RdvUuid } from '../../../domain/rdv-uuid'
import { StatutPresence } from '../../../domain/statut-presence'
import { UrlAgent } from '../../../domain/url-agent'
import { decisionPourWebhookRdv, webhookRdvModifie } from './decision-webhook'
import { EvenementWebhook } from './evenement-webhook'

const rdv = (
  surcharge: Partial<Extract<Rdv, { collectif: false }>> = {},
): Rdv => ({
  id: RdvId(1),
  uuid: RdvUuid('0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b'),
  agentId: RdvAgentId(4242),
  organisationId: OrganisationId(7),
  adresse: AdresseRdv('12 rue de la Paix, 75002 Paris'),
  debut: new Date('2026-09-01T09:00:00.000Z'),
  fin: new Date('2026-09-01T10:00:00.000Z'),
  duree: DureeEnMinutes(60),
  statutPresence: StatutPresence('unknown'),
  urlAgent: UrlAgent('https://rdv.anct.gouv.fr/admin/rdvs/1'),
  nombreParticipants: 1,
  contexte: null,
  creeParId: null,
  annulation: null,
  motif: null,
  lieu: null,
  collectif: false,
  participations: [],
  ...surcharge,
})

const misAJour = EvenementWebhook('updated')
const detruit = EvenementWebhook('destroyed')

describe('decisionPourWebhookRdv', () => {
  it('enregistre un rendez-vous inconnu', () => {
    const decision = decisionPourWebhookRdv({
      evenement: misAJour,
      recu: rdv(),
      connu: null,
      synchroniserDepuis: null,
    })

    expect(decision._tag).toBe('enregistrer')
  })

  it('supprime un rendez-vous détruit chez RDV Service Public', () => {
    const decision = decisionPourWebhookRdv({
      evenement: detruit,
      recu: rdv(),
      connu: { rdv: rdv(), craRefuse: false },
      synchroniserDepuis: null,
    })

    expect(decision._tag).toBe('supprimer')
  })

  it('ignore une suppression déjà appliquée — la notification peut arriver deux fois', () => {
    const decision = decisionPourWebhookRdv({
      evenement: detruit,
      recu: rdv(),
      connu: null,
      synchroniserDepuis: null,
    })

    expect(decision).toEqual({ _tag: 'ignorer', raison: 'dejaSupprime' })
  })

  describe('fenêtre de synchronisation', () => {
    const fenetre = new Date('2026-08-01T00:00:00.000Z')

    it('écarte un rendez-vous antérieur à la fenêtre', () => {
      const decision = decisionPourWebhookRdv({
        evenement: misAJour,
        recu: rdv({ debut: new Date('2026-07-01T09:00:00.000Z') }),
        connu: null,
        synchroniserDepuis: fenetre,
      })

      expect(decision).toEqual({
        _tag: 'ignorer',
        raison: 'horsFenetreDeSynchronisation',
      })
    })

    it('sort un rendez-vous détenu que la fenêtre ne couvre plus', () => {
      const ancien = rdv({ debut: new Date('2026-07-01T09:00:00.000Z') })

      const decision = decisionPourWebhookRdv({
        evenement: misAJour,
        recu: ancien,
        connu: { rdv: ancien, craRefuse: false },
        synchroniserDepuis: fenetre,
      })

      expect(decision._tag).toBe('supprimer')
    })

    it('accepte un rendez-vous qui commence à la fenêtre elle-même', () => {
      const decision = decisionPourWebhookRdv({
        evenement: misAJour,
        recu: rdv({ debut: fenetre }),
        connu: null,
        synchroniserDepuis: fenetre,
      })

      expect(decision._tag).toBe('enregistrer')
    })
  })

  describe('refus de compte rendu', () => {
    it('préserve le refus quand la notification n’apporte rien', () => {
      const decision = decisionPourWebhookRdv({
        evenement: misAJour,
        recu: rdv(),
        connu: { rdv: rdv(), craRefuse: true },
        synchroniserDepuis: null,
      })

      expect(decision).toEqual({
        _tag: 'ignorer',
        raison: 'refusDeCraPreserve',
      })
    })

    it('cède devant un changement réel', () => {
      const decision = decisionPourWebhookRdv({
        evenement: misAJour,
        recu: rdv({ statutPresence: StatutPresence('noshow') }),
        connu: { rdv: rdv(), craRefuse: true },
        synchroniserDepuis: null,
      })

      expect(decision._tag).toBe('enregistrer')
    })

    it('ne protège rien quand aucun refus n’a été exprimé', () => {
      const decision = decisionPourWebhookRdv({
        evenement: misAJour,
        recu: rdv(),
        connu: { rdv: rdv(), craRefuse: false },
        synchroniserDepuis: null,
      })

      expect(decision._tag).toBe('enregistrer')
    })

    it('cède devant une suppression, quel que soit le refus', () => {
      const decision = decisionPourWebhookRdv({
        evenement: detruit,
        recu: rdv(),
        connu: { rdv: rdv(), craRefuse: true },
        synchroniserDepuis: null,
      })

      expect(decision._tag).toBe('supprimer')
    })
  })
})

describe('webhookRdvModifie', () => {
  it('ne voit rien changer entre deux copies', () => {
    expect(webhookRdvModifie(rdv(), rdv())).toBe(false)
  })

  it.each([
    ['le statut', { statutPresence: StatutPresence('seen') }],
    ['la durée', { duree: DureeEnMinutes(30) }],
    ['le début', { debut: new Date('2026-09-02T09:00:00.000Z') }],
    ['l’organisation', { organisationId: OrganisationId(9) }],
  ])('détecte un changement sur %s', (_, changement) => {
    expect(webhookRdvModifie(rdv(), rdv(changement))).toBe(true)
  })

  it('ignore l’adresse, que la notification ne fiabilise pas', () => {
    expect(
      webhookRdvModifie(rdv(), rdv({ adresse: AdresseRdv('Ailleurs') })),
    ).toBe(false)
  })
})
