import { emptyOpeningHours } from '@app/web/components/structure/fields/openingHoursHelpers'
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
      const modification = depuisLaSaisie(informationsGenerales)

      if (modification.section !== 'InformationsGenerales')
        throw new Error('la section attendue n’a pas été produite')
      expect(modification.adresse).toEqual({
        voie: '12 rue de la Paix',
        commune: 'Reims',
        code_postal: '51100',
        code_insee: '51454',
      })
      expect(modification.localisation).toEqual({
        latitude: 49.25,
        longitude: 4.03,
      })
      expect(modification.banId).toBe('80144_0018_00090')
    })

    it('traduit l’itinérance tri-état du formulaire', () => {
      const cas = [
        [null, []],
        [true, [Itinerance.Itinerant]],
        [false, [Itinerance.Fixe]],
      ] as const

      const obtenus = cas.map(([lieuItinerant]) => {
        const modification = depuisLaSaisie({
          ...informationsGenerales,
          lieuItinerant,
        })

        return modification.section === 'InformationsGenerales'
          ? modification.itinerance
          : null
      })

      expect(obtenus).toEqual(cas.map(([, attendu]) => attendu))
    })

    it('écarte une immatriculation qui n’en est pas une', () => {
      const modification = depuisLaSaisie({
        ...informationsGenerales,
        siret: '123',
        nomUsage: 'UN NOM D’USAGE',
      })

      if (modification.section !== 'InformationsGenerales')
        throw new Error('la section attendue n’a pas été produite')
      expect(modification.pivot).toBeNull()
      // Le nom d'usage vient de SIRENE : sans immatriculation il n'a plus d'objet.
      expect(modification.nomUsage).toBeNull()
    })
  })

  describe('informations pratiques', () => {
    it('conserve les sites web multiples que la colonne joint par « | »', () => {
      const modification = depuisLaSaisie({
        section: 'InformationsPratiques',
        siteWeb: 'https://un.example.fr|https://deux.example.fr',
        ficheAccesLibre: null,
        priseRdv: null,
        openingHours: emptyOpeningHours,
        horairesComment: null,
      })

      if (modification.section !== 'InformationsPratiques')
        throw new Error('la section attendue n’a pas été produite')
      expect(modification.sitesWeb).toEqual([
        'https://un.example.fr',
        'https://deux.example.fr',
      ])
    })
  })

  describe('modalités d’accès', () => {
    it('n’emporte le moyen de contact que si sa case est cochée', () => {
      const modification = depuisLaSaisie({
        section: 'ModalitesAccesAuService',
        surPlace: true,
        parTelephone: false,
        numeroTelephone: '01 80 05 98 80',
        parMail: true,
        adresseMail: 'contact@example.fr',
        fraisACharge: [],
      })

      if (modification.section !== 'ModalitesAccesAuService')
        throw new Error('la section attendue n’a pas été produite')
      expect(modification.modalitesAcces).toEqual([
        ModaliteAcces.SePresenter,
        ModaliteAcces.ContacterParMail,
      ])
      expect(modification.telephone).toBeNull()
      expect(modification.courriels).toEqual(['contact@example.fr'])
    })
  })

  describe('publics accueillis', () => {
    it('traduit « tout public » par l’absence de public spécifique', () => {
      const modification = depuisLaSaisie({
        section: 'TypesDePublicsAccueillis',
        toutPublic: true,
        publicsSpecifiquementAdresses: ['Jeunes'],
        priseEnChargeSpecifique: [],
      })

      if (modification.section !== 'TypesDePublicsAccueillis')
        throw new Error('la section attendue n’a pas été produite')
      expect(modification.publicsSpecifiquementAdresses).toEqual([])
    })
  })
})
