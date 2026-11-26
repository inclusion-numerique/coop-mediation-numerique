import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { MotifId } from '../../../domain/identifiants/motif-id'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../domain/identifiants/rdv-id'
import { RdvUuid } from '../../../domain/identifiants/rdv-uuid'
import { NomAtelier, NomMotif } from '../../../domain/libelle'
import { AdresseRdv } from '../../../domain/rdv/adresse-rdv'
import { DureeEnMinutes } from '../../../domain/rdv/duree-en-minutes'
import { type Lieu, LieuId, NomLieu } from '../../../domain/rdv/lieu'
import type { Motif } from '../../../domain/rdv/motif'
import type { Rdv } from '../../../domain/rdv/rdv'
import { StatutPresence } from '../../../domain/rdv/statut-presence'
import { UrlAgent } from '../../../domain/url-agent'
import { EvenementWebhook } from '../../../domain/webhook/evenement-webhook'
import type { RdvConnu } from './decision-webhook'
import {
  type DependancesRecevoirWebhookRdv,
  recevoirWebhookRdv,
} from './recevoir-webhook-rdv'

const agentId = RdvAgentId(4242)

const motif = (id: number): Motif => ({
  id: MotifId(id),
  nom: NomMotif('Accompagnement numérique'),
  collectif: false,
  organisationId: OrganisationId(7),
  suivi: false,
  instruction: null,
  typeDeLieu: null,
  categorieId: null,
})

const lieu = (id: number): Lieu => ({
  id: LieuId(id),
  nom: NomLieu('Médiathèque'),
  adresse: null,
  organisationId: OrganisationId(7),
  telephone: null,
  usageUnique: false,
})

const rdv = (
  surcharge: Partial<Extract<Rdv, { collectif: false }>> = {},
): Rdv => ({
  id: RdvId(1),
  uuid: RdvUuid('0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b'),
  agentId,
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
  motif: motif(3),
  lieu: lieu(11),
  collectif: false,
  participations: [],
  ...surcharge,
})

const atelier = (nom: string): Rdv => ({
  ...rdv(),
  collectif: true,
  nom: NomAtelier(nom),
  participantsMax: null,
})

const fenetre = new Date('2026-08-01T00:00:00.000Z')

const dependances: DependancesRecevoirWebhookRdv = {
  lireNotification: () => success({ agentId, rdv: rdv() }),
  comptePourWebhook: async () => ({
    synchroniserDepuis: null,
    mediateurId: 'b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b',
  }),
  rdvConnuParId: async () => null,
  organisationConnue: async () => true,
  enregistrer: async () => undefined,
  supprimer: async () => undefined,
  rapprocherBeneficiaires: async () => undefined,
}

const misAJour = { evenement: EvenementWebhook('updated'), payload: {} }
const detruit = { evenement: EvenementWebhook('destroyed'), payload: {} }

const recu = (rdvRecu: Rdv) => () => success({ agentId, rdv: rdvRecu })

const connu =
  (rdvConnu: Rdv, compteRenduRegle: boolean) =>
  async (): Promise<RdvConnu> => ({ rdv: rdvConnu, compteRenduRegle })

describe('recevoirWebhookRdv', () => {
  it('enregistre un rendez-vous inconnu', async () => {
    expect(await recevoirWebhookRdv(dependances)(misAJour)).toEqual({
      _tag: 'traite',
      action: 'enregistre',
    })
  })

  it('enregistre le rendez-vous d’un compte sans médiateur', async () => {
    const resultat = await recevoirWebhookRdv({
      ...dependances,
      comptePourWebhook: async () => ({
        synchroniserDepuis: null,
        mediateurId: null,
      }),
    })(misAJour)

    expect(resultat).toEqual({ _tag: 'traite', action: 'enregistre' })
  })

  it('renonce à une notification dont le payload a changé de forme', async () => {
    const resultat = await recevoirWebhookRdv({
      ...dependances,
      lireNotification: () => failure('payloadInexploitable'),
    })(misAJour)

    expect(resultat).toEqual({ _tag: 'ignore', raison: 'payloadInexploitable' })
  })

  it('renonce à une notification pour un compte que La Coop ne suit pas', async () => {
    const resultat = await recevoirWebhookRdv({
      ...dependances,
      comptePourWebhook: async () => null,
    })(misAJour)

    expect(resultat).toEqual({ _tag: 'ignore', raison: 'compteInconnu' })
  })

  it('renonce quand l’organisation du rendez-vous n’est pas encore connue', async () => {
    const resultat = await recevoirWebhookRdv({
      ...dependances,
      organisationConnue: async () => false,
    })(misAJour)

    expect(resultat).toEqual({ _tag: 'ignore', raison: 'organisationInconnue' })
  })

  it('supprime un rendez-vous détruit chez RDV Service Public', async () => {
    const resultat = await recevoirWebhookRdv({
      ...dependances,
      rdvConnuParId: connu(rdv(), false),
    })(detruit)

    expect(resultat).toEqual({ _tag: 'traite', action: 'supprime' })
  })

  it('ignore une suppression déjà appliquée — la notification peut arriver deux fois', async () => {
    expect(await recevoirWebhookRdv(dependances)(detruit)).toEqual({
      _tag: 'ignore',
      raison: 'dejaSupprime',
    })
  })

  describe('fenêtre de synchronisation', () => {
    const compteSuiviDepuisLaFenetre = async () => ({
      synchroniserDepuis: fenetre,
      mediateurId: null,
    })

    const ancien = rdv({ debut: new Date('2026-07-01T09:00:00.000Z') })

    it('écarte un rendez-vous antérieur à la fenêtre', async () => {
      const resultat = await recevoirWebhookRdv({
        ...dependances,
        comptePourWebhook: compteSuiviDepuisLaFenetre,
        lireNotification: recu(ancien),
      })(misAJour)

      expect(resultat).toEqual({
        _tag: 'ignore',
        raison: 'horsFenetreDeSynchronisation',
      })
    })

    it('sort un rendez-vous détenu que la fenêtre ne couvre plus', async () => {
      const resultat = await recevoirWebhookRdv({
        ...dependances,
        comptePourWebhook: compteSuiviDepuisLaFenetre,
        lireNotification: recu(ancien),
        rdvConnuParId: connu(ancien, false),
      })(misAJour)

      expect(resultat).toEqual({ _tag: 'traite', action: 'supprime' })
    })

    it('accepte un rendez-vous qui commence à la fenêtre elle-même', async () => {
      const resultat = await recevoirWebhookRdv({
        ...dependances,
        comptePourWebhook: compteSuiviDepuisLaFenetre,
        lireNotification: recu(rdv({ debut: fenetre })),
      })(misAJour)

      expect(resultat).toEqual({ _tag: 'traite', action: 'enregistre' })
    })
  })

  describe('refus de compte rendu', () => {
    it('préserve le refus quand la notification n’apporte rien', async () => {
      const resultat = await recevoirWebhookRdv({
        ...dependances,
        rdvConnuParId: connu(rdv(), true),
      })(misAJour)

      expect(resultat).toEqual({
        _tag: 'ignore',
        raison: 'reglageDuCompteRenduPreserve',
      })
    })

    it.each<[string, Rdv]>([
      ['le statut', rdv({ statutPresence: StatutPresence('noshow') })],
      ['la durée', rdv({ duree: DureeEnMinutes(30) })],
      ['le début', rdv({ debut: new Date('2026-09-02T09:00:00.000Z') })],
      ['la fin', rdv({ fin: new Date('2026-09-01T11:00:00.000Z') })],
      ['l’organisation', rdv({ organisationId: OrganisationId(9) })],
      ['le motif', rdv({ motif: motif(4) })],
      ['la disparition du motif', rdv({ motif: null })],
      ['le lieu', rdv({ lieu: lieu(12) })],
      ['la disparition du lieu', rdv({ lieu: null })],
      ['le passage en atelier collectif', atelier('Atelier CV')],
    ])('cède devant un changement réel sur %s', async (_, rdvRecu) => {
      const resultat = await recevoirWebhookRdv({
        ...dependances,
        lireNotification: recu(rdvRecu),
        rdvConnuParId: connu(rdv(), true),
      })(misAJour)

      expect(resultat).toEqual({ _tag: 'traite', action: 'enregistre' })
    })

    it.each<[string, Rdv]>([
      ['un motif', rdv({ lieu: null })],
      ['un lieu', rdv({ motif: null })],
    ])('cède devant l’apparition d’%s', async (_, rdvRecu) => {
      const resultat = await recevoirWebhookRdv({
        ...dependances,
        lireNotification: recu(rdvRecu),
        rdvConnuParId: connu(rdv({ motif: null, lieu: null }), true),
      })(misAJour)

      expect(resultat).toEqual({ _tag: 'traite', action: 'enregistre' })
    })

    it('cède devant un atelier renommé', async () => {
      const resultat = await recevoirWebhookRdv({
        ...dependances,
        lireNotification: recu(atelier('Atelier emploi')),
        rdvConnuParId: connu(atelier('Atelier CV'), true),
      })(misAJour)

      expect(resultat).toEqual({ _tag: 'traite', action: 'enregistre' })
    })

    it('préserve le refus d’un atelier dont le nom n’a pas changé', async () => {
      const resultat = await recevoirWebhookRdv({
        ...dependances,
        lireNotification: recu(atelier('Atelier CV')),
        rdvConnuParId: connu(atelier('Atelier CV'), true),
      })(misAJour)

      expect(resultat).toEqual({
        _tag: 'ignore',
        raison: 'reglageDuCompteRenduPreserve',
      })
    })

    it('tient le refus malgré une adresse retouchée, que la notification ne fiabilise pas', async () => {
      const resultat = await recevoirWebhookRdv({
        ...dependances,
        lireNotification: recu(rdv({ adresse: AdresseRdv('Ailleurs') })),
        rdvConnuParId: connu(rdv(), true),
      })(misAJour)

      expect(resultat).toEqual({
        _tag: 'ignore',
        raison: 'reglageDuCompteRenduPreserve',
      })
    })

    it('ne protège rien quand aucun refus n’a été exprimé', async () => {
      const resultat = await recevoirWebhookRdv({
        ...dependances,
        rdvConnuParId: connu(rdv(), false),
      })(misAJour)

      expect(resultat).toEqual({ _tag: 'traite', action: 'enregistre' })
    })

    it('cède devant une suppression, quel que soit le refus', async () => {
      const resultat = await recevoirWebhookRdv({
        ...dependances,
        rdvConnuParId: connu(rdv(), true),
      })(detruit)

      expect(resultat).toEqual({ _tag: 'traite', action: 'supprime' })
    })
  })
})
