import { describe, expect, it } from 'vitest'
import { lieuInventorie } from './lieu-inventorie.transfer'

const creation = new Date('2026-01-15T10:00:00.000Z')
const modification = new Date('2026-02-01T08:30:00.000Z')

const lieu = {
  v1StructureIdPg: 42,
  structureCartographieNationaleId: 'Coop-numérique_1234',
  creation,
  modification,
  suppression: null,
  nom: 'Espace numérique',
  adresse: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  complementAdresse: 'Bâtiment B',
  latitude: 49.25,
  longitude: 4.03,
  siret: '12345678900012',
  rna: null,
  visiblePourCartographieNationale: true,
  typologies: ['TIERS_LIEUX'],
  presentationResume: 'Un espace ouvert à tous',
  presentationDetail: null,
  siteWeb: 'https://espace.example|https://autre.example',
  telephone: '+33326000000',
  courriels: ['contact@espace.example'],
  ficheAccesLibre: null,
  horaires: 'Mo-Fr 09:00-18:00',
  priseRdv: null,
  services: ['Aide aux démarches administratives'],
  publicsSpecifiquementAdresses: ['Jeunes'],
  priseEnChargeSpecifique: [],
  fraisACharge: ['Gratuit'],
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: ['Label local'],
  itinerance: [],
  modalitesAcces: ['Se présenter'],
  modalitesAccompagnement: ['Seul'],
  _count: { mediateursEnActivite: 3 },
}

describe('lieu inventorié exposé par l’API', () => {
  it('expose les champs du lieu au vocabulaire de l’API', () => {
    expect(lieuInventorie(lieu)).toEqual({
      id_pg: 42,
      structure_cartographie_nationale_id: 'Coop-numérique_1234',
      creation: '2026-01-15T10:00:00.000Z',
      modification: '2026-02-01T08:30:00.000Z',
      suppression: null,
      nom: 'Espace numérique',
      adresse: '12 rue de la Paix',
      commune: 'Reims',
      code_postal: '51100',
      code_insee: '51454',
      complement_adresse: 'Bâtiment B',
      latitude: 49.25,
      longitude: 4.03,
      siret: '12345678900012',
      rna: null,
      visible_pour_cartographie_nationale: true,
      typologies: ['TIERS_LIEUX'],
      presentation_resume: 'Un espace ouvert à tous',
      presentation_detail: null,
      site_web: 'https://espace.example|https://autre.example',
      telephone: '+33326000000',
      courriels: ['contact@espace.example'],
      fiche_acces_libre: null,
      horaires: 'Mo-Fr 09:00-18:00',
      prise_rdv: null,
      services: ['Aide aux démarches administratives'],
      publics_specifiquement_adresses: ['Jeunes'],
      prise_en_charge_specifique: [],
      frais_a_charge: ['Gratuit'],
      dispositif_programmes_nationaux: [],
      formations_labels: [],
      autres_formations_labels: ['Label local'],
      itinerance: [],
      modalites_acces: ['Se présenter'],
      modalites_accompagnement: ['Seul'],
      mediateurs_en_activite: 3,
      emplois: 0,
    })
  })

  it('expose la date de suppression d’un lieu supprimé', () => {
    expect(
      lieuInventorie({
        ...lieu,
        suppression: new Date('2026-03-01T00:00:00.000Z'),
      }).suppression,
    ).toBe('2026-03-01T00:00:00.000Z')
  })
})
