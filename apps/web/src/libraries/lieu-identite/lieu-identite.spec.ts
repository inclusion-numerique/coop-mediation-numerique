import {
  correler,
  type LieuAMaterialiser,
  type LieuCandidat,
} from './lieu-identite'

const lieu = (donnees: Partial<LieuAMaterialiser> = {}): LieuAMaterialiser => ({
  nom: 'Maison France Services',
  adresse: '1 rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
  codeInsee: '75101',
  latitude: 48.869,
  longitude: 2.331,
  ...donnees,
})

const candidat = (donnees: Partial<LieuCandidat> = {}): LieuCandidat => ({
  id: 'candidat-1',
  nom: 'Maison France Services',
  adresse: '1 rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
  codeInsee: '75101',
  latitude: 48.869,
  longitude: 2.331,
  suppression: null,
  ...donnees,
})

describe('correler', () => {
  it('ne rapproche rien quand la coop ne connaît aucun lieu', () => {
    expect(correler([], lieu())).toBeNull()
  })

  it('reconnaît le même endroit : même commune, même dénomination, même adresse', () => {
    expect(correler([candidat()], lieu())).toEqual({
      id: 'candidat-1',
      suppression: null,
      forte: true,
    })
  })

  describe('le SIRET ne participe pas à la reconnaissance', () => {
    // Une association dont le siège est à Paris déclare légitimement ce SIRET
    // pour son antenne de Nantes. Le type d'entrée ne le porte donc même plus :
    // ces cas se jouent entièrement sur l'endroit.
    it('deux implantations d’une même structure restent deux lieux', () => {
      const antenneNantaise = lieu({
        commune: 'Nantes',
        codePostal: '44000',
        codeInsee: '44109',
        adresse: '4 rue de la Distillerie',
        latitude: 47.218,
        longitude: -1.554,
      })

      expect(correler([candidat()], antenneNantaise)).toBeNull()
    })

    it('deux structures à la même adresse sous des noms différents restent deux lieux', () => {
      const autreStructure = lieu({ nom: 'Association Trait d’Union' })

      expect(correler([candidat()], autreStructure)).toBeNull()
    })
  })

  describe('la commune se reconnaît au-delà du code INSEE', () => {
    it('rapproche l’arrondissement et la commune (Paris, Lyon, Marseille)', () => {
      const sousLeCodeCommune = candidat({ codeInsee: '75056' })

      expect(correler([sousLeCodeCommune], lieu())).toMatchObject({
        id: 'candidat-1',
      })
    })

    it('sépare deux communes partageant un code postal', () => {
      const villageVoisin = candidat({
        commune: 'Anthy-sur-Léman',
        codeInsee: '74012',
        latitude: 46.361,
        longitude: 6.443,
      })

      expect(correler([villageVoisin], lieu({ codeInsee: null }))).toBeNull()
    })
  })

  describe('l’adresse départage les homonymes', () => {
    it('sépare deux homonymes à des adresses différentes', () => {
      const ailleurs = lieu({
        adresse: '99 avenue Ailleurs',
        latitude: 48.9,
        longitude: 2.4,
      })

      expect(correler([candidat()], ailleurs)).toBeNull()
    })

    it('rapproche deux libellés d’adresse différents à moins de 50 mètres', () => {
      // « PL DU HUIT MAI 1945 » et « Place du 8 Mai 1945 » : mêmes coordonnées.
      const memeEndroitAutreLibelle = lieu({
        adresse: 'PL DU HUIT MAI 1945',
        latitude: 48.8692,
        longitude: 2.3312,
      })

      expect(correler([candidat()], memeEndroitAutreLibelle)).toMatchObject({
        id: 'candidat-1',
      })
    })

    it('sépare deux adresses distinctes au-delà de 50 mètres', () => {
      const deuxCentsMetresPlusLoin = lieu({
        adresse: 'PL DU HUIT MAI 1945',
        latitude: 48.871,
        longitude: 2.3312,
      })

      expect(correler([candidat()], deuxCentsMetresPlusLoin)).toBeNull()
    })

    it('sans coordonnées, deux adresses franchement différentes ne rapprochent pas', () => {
      const sansCoordonnees = candidat({ latitude: null, longitude: null })
      const ailleurs = lieu({
        adresse: '254 avenue du Général Leclerc',
        latitude: null,
        longitude: null,
      })

      expect(correler([sansCoordonnees], ailleurs)).toBeNull()
    })

    it('sans coordonnées, deux écritures d’une même adresse rapprochent', () => {
      const sansCoordonnees = candidat({ latitude: null, longitude: null })
      const memeVoieAutreEcriture = lieu({
        adresse: 'RUE DE LA PAIX',
        latitude: null,
        longitude: null,
      })

      expect(correler([sansCoordonnees], memeVoieAutreEcriture)).toMatchObject({
        id: 'candidat-1',
      })
    })
  })

  describe('un libellé non diffusible ne désigne personne', () => {
    it('ne rapproche pas deux lieux dont l’adresse est non diffusible', () => {
      const nonDiffusible = candidat({ adresse: '[Non diffusible]' })
      const autreNonDiffusible = lieu({
        nom: 'Association Trait d’Union',
        adresse: '[Non diffusible]',
      })

      expect(correler([nonDiffusible], autreNonDiffusible)).toBeNull()
    })

    it('rapproche deux non diffusibles de même dénomination dans la commune', () => {
      const nonDiffusible = candidat({ adresse: '[Non diffusible]' })

      expect(
        correler([nonDiffusible], lieu({ adresse: '[Non diffusible]' })),
      ).toMatchObject({ id: 'candidat-1' })
    })

    it('une adresse manquante ne sépare pas deux lieux au même point', () => {
      const nonDiffusible = candidat({ adresse: '[Non diffusible]' })

      expect(correler([nonDiffusible], lieu())).toMatchObject({
        id: 'candidat-1',
      })
    })

    it('une adresse manquante ne rapproche pas deux points distants', () => {
      const nonDiffusible = candidat({ adresse: '[Non diffusible]' })
      const troisCentsMetresPlusLoin = lieu({ latitude: 48.8717 })

      expect(correler([nonDiffusible], troisCentsMetresPlusLoin)).toBeNull()
    })
  })

  describe('force de la corrélation — elle seule autorise à relever un lieu supprimé', () => {
    it('est forte quand les dénominations sont identiques', () => {
      expect(correler([candidat()], lieu())).toMatchObject({ forte: true })
    })

    it('est faible quand une dénomination est seulement contenue dans l’autre', () => {
      const nomPlusLong = lieu({ nom: 'Maison France Services Annexe' })

      expect(correler([candidat()], nomPlusLong)).toMatchObject({
        forte: false,
      })
    })
  })

  describe('départage entre plusieurs candidats', () => {
    it('préfère un lieu actif à un lieu supprimé', () => {
      const supprime = candidat({
        id: 'supprime',
        suppression: new Date('2026-01-01'),
      })
      const actif = candidat({ id: 'actif' })

      expect(correler([supprime, actif], lieu())).toMatchObject({ id: 'actif' })
    })

    it('parmi les actifs, préfère celui dont l’adresse correspond exactement', () => {
      const parProximite = candidat({
        id: 'par-proximite',
        adresse: 'PL DU HUIT MAI 1945',
      })
      const memeAdresse = candidat({ id: 'meme-adresse' })

      expect(correler([parProximite, memeAdresse], lieu())).toMatchObject({
        id: 'meme-adresse',
      })
    })

    it('à défaut d’actif, rend le lieu supprimé et son état', () => {
      const suppression = new Date('2026-01-01')
      const supprime = candidat({ id: 'supprime', suppression })

      expect(correler([supprime], lieu())).toEqual({
        id: 'supprime',
        suppression,
        forte: true,
      })
    })
  })
})
