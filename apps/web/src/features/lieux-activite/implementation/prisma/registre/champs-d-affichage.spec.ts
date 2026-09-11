import { champsDAffichage } from './champs-d-affichage'
import type { InscriptionPourLaFiche } from './fiche-du-registre'

const inscription = (
  surcharge: Partial<InscriptionPourLaFiche> = {},
): InscriptionPourLaFiche => ({
  nom: 'Espace numérique',
  nomUsage: 'La Quincaillerie',
  complementAdresse: 'Bâtiment C',
  visiblePourCartographieNationale: true,
  ficheAccesLibre: null,
  priseRdv: null,
  horaires: null,
  presentationResume: null,
  presentationDetail: null,
  siretALEnrichissement: null,
  structureCartographieNationaleId: 'carto-42',
  contact: {},
  typologies: [],
  services: [],
  publicsSpecifiquementAdresses: [],
  priseEnChargeSpecifique: [],
  modalitesAcces: [],
  fraisACharge: [],
  itinerance: [],
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: [],
  modalitesAccompagnement: [],
  source: null,
  updatedAtCarto: null,
  updatedAtCoop: null,
  updatedAtMin: null,
  adresse: {
    numeroVoie: 12,
    repetition: null,
    nomVoie: 'rue Foch',
    nomCommune: 'Reims',
    codePostal: '51100',
    codeInsee: '51454',
    codeBan: null,
  },
  ...surcharge,
})

describe('ce qu’une liste montre d’une inscription', () => {
  it('étale l’adresse en colonnes séparées', () => {
    expect(champsDAffichage(inscription())).toMatchObject({
      adresse: '12 rue Foch',
      complementAdresse: 'Bâtiment C',
      commune: 'Reims',
      codePostal: '51100',
      codeInsee: '51454',
    })
  })

  it('rend l’identité et le lien vers la cartographie', () => {
    expect(champsDAffichage(inscription())).toMatchObject({
      nom: 'Espace numérique',
      nomUsage: 'La Quincaillerie',
      visiblePourCartographieNationale: true,
      structureCartographieNationaleId: 'carto-42',
    })
  })

  it('laisse les colonnes d’adresse vides quand l’inscription n’en a pas', () => {
    expect(champsDAffichage(inscription({ adresse: null }))).toMatchObject({
      adresse: null,
      complementAdresse: null,
      commune: null,
      codePostal: null,
      codeInsee: null,
    })
  })
})
