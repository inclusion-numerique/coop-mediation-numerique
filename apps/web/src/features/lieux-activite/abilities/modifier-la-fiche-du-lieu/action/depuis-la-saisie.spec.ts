import { emptyOpeningHours } from '@app/web/opening-hours/openingHoursHelpers'
import {
  Itinerance,
  ModaliteAcces,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { depuisLaSaisie } from './depuis-la-saisie'

const adresseBan = {
  id: '80144_0018_00090',
  label: '12 rue de la Paix, 51100 Reims',
  nom: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  contexte: '51, Marne, Grand Est',
  latitude: 49.25,
  longitude: 4.03,
}

const informationsGenerales = {
  section: 'InformationsGenerales' as const,
  nom: 'Maison France Services',
  adresseBan,
  complementAdresse: null,
  lieuItinerant: null,
  typologies: [],
  siret: null,
  rna: null,
  nomUsage: null,
}

describe('la saisie devient un modèle du domaine', () => {
  describe('informations générales', () => {
    it('compose l’adresse et la localisation depuis la réponse BAN', () => {
      expect(depuisLaSaisie(informationsGenerales)).toMatchObject({
        section: 'InformationsGenerales',
        adresse: {
          voie: '12 rue de la Paix',
          commune: 'Reims',
          code_postal: '51100',
          code_insee: '51454',
        },
        localisation: { latitude: 49.25, longitude: 4.03 },
        banId: '80144_0018_00090',
      })
    })

    it.each([
      { lieuItinerant: null, itinerance: [] },
      { lieuItinerant: true, itinerance: [Itinerance.Itinerant] },
      { lieuItinerant: false, itinerance: [Itinerance.Fixe] },
    ])(
      'traduit l’itinérance tri-état du formulaire : $lieuItinerant',
      ({ lieuItinerant, itinerance }) => {
        expect(
          depuisLaSaisie({ ...informationsGenerales, lieuItinerant }),
        ).toMatchObject({ section: 'InformationsGenerales', itinerance })
      },
    )

    it('écarte une immatriculation qui n’en est pas une', () => {
      expect(
        depuisLaSaisie({
          ...informationsGenerales,
          siret: '123',
          nomUsage: 'UN NOM D’USAGE',
        }),
      ).toMatchObject({
        section: 'InformationsGenerales',
        pivot: null,
        // Le nom d'usage vient de SIRENE : sans immatriculation il n'a plus d'objet.
        nomUsage: null,
      })
    })
  })

  describe('informations pratiques', () => {
    it('conserve les sites web multiples que la colonne joint par « | »', () => {
      expect(
        depuisLaSaisie({
          section: 'InformationsPratiques',
          siteWeb: 'https://un.example.fr|https://deux.example.fr',
          ficheAccesLibre: null,
          priseRdv: null,
          openingHours: emptyOpeningHours,
          horairesComment: null,
        }),
      ).toMatchObject({
        section: 'InformationsPratiques',
        sitesWeb: ['https://un.example.fr', 'https://deux.example.fr'],
      })
    })
  })

  describe('modalités d’accès', () => {
    it('n’emporte le moyen de contact que si sa case est cochée', () => {
      expect(
        depuisLaSaisie({
          section: 'ModalitesAccesAuService',
          surPlace: true,
          parTelephone: false,
          numeroTelephone: '01 80 05 98 80',
          parMail: true,
          adresseMail: 'contact@example.fr',
          fraisACharge: [],
        }),
      ).toMatchObject({
        section: 'ModalitesAccesAuService',
        modalitesAcces: [
          ModaliteAcces.SePresenter,
          ModaliteAcces.ContacterParMail,
        ],
        telephone: null,
        courriels: ['contact@example.fr'],
      })
    })
  })

  describe('publics accueillis', () => {
    it('traduit « tout public » par l’absence de public spécifique', () => {
      expect(
        depuisLaSaisie({
          section: 'TypesDePublicsAccueillis',
          toutPublic: true,
          publicsSpecifiquementAdresses: ['Jeunes'],
          priseEnChargeSpecifique: [],
        }),
      ).toMatchObject({
        section: 'TypesDePublicsAccueillis',
        publicsSpecifiquementAdresses: [],
      })
    })
  })
})
