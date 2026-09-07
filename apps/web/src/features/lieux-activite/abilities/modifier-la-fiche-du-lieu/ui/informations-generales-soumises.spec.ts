import { informationsGeneralesSoumises } from './informations-generales-soumises'

const adresseBan = {
  id: '17299_0123_00012',
  label: '12 quai du Port, 17300 Rochefort',
  nom: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
  contexte: '17, Charente-Maritime',
  latitude: 45.94,
  longitude: -0.96,
}

const etablissement = {
  nom: 'MAISON FRANCE SERVICES',
  adresse: '12 quai du Port',
  codePostal: '17300',
  commune: 'Rochefort',
  codeInsee: '17299',
  siret: '13002603200016',
  source: 'api' as const,
}

/** Ce que le formulaire porte à l'écran, adresse déjà reconnue par la BAN. */
type Formulaire = Parameters<typeof informationsGeneralesSoumises>[0]

const formulaire = (champs: Partial<Formulaire> = {}): Formulaire => ({
  id: '0927f824-b84d-4840-ae2e-e4a96a7a519b',
  nom: 'Tiers-lieu du Port',
  adresseBan,
  lieuItinerant: null,
  complementAdresse: null,
  siretSearch: null,
  rna: null,
  nomUsage: null,
  noSiret: true,
  typologies: [],
  ...champs,
})

describe('avec un SIRET', () => {
  const avecSiret = formulaire({
    noSiret: false,
    siretSearch: etablissement,
    nom: etablissement.nom,
    nomUsage: 'La Maison du Port',
    lieuItinerant: true,
  })

  /**
   * Un SIRET vient TOUJOURS de l'Annuaire des entreprises, seul à pouvoir
   * l'attester. Ne pas le transmettre l'effaçait à chaque enregistrement.
   */
  it('transmet le SIRET choisi dans l’Annuaire', () => {
    expect(informationsGeneralesSoumises(avecSiret).siret).toBe(
      '13002603200016',
    )
  })

  /** Le médiateur qui veut paraître sous un autre nom dispose du nom d'usage. */
  it('transmet le nom d’usage', () => {
    expect(informationsGeneralesSoumises(avecSiret).nomUsage).toBe(
      'La Maison du Port',
    )
  })

  /** L'itinérance ne se déclare que pour un lieu sans immatriculation. */
  it('n’emporte pas l’itinérance', () => {
    expect(informationsGeneralesSoumises(avecSiret).lieuItinerant).toBeNull()
  })
})

describe('sans SIRET', () => {
  const sansSiret = formulaire({
    noSiret: true,
    siretSearch: etablissement,
    nomUsage: 'La Maison du Port',
    lieuItinerant: true,
  })

  it('n’envoie aucune immatriculation, même si un établissement reste sélectionné', () => {
    expect(informationsGeneralesSoumises(sansSiret).siret).toBeNull()
  })

  /** Sans immatriculation, le nom d'usage n'a plus d'objet. */
  it('efface le nom d’usage', () => {
    expect(informationsGeneralesSoumises(sansSiret).nomUsage).toBeNull()
  })

  it('emporte l’itinérance déclarée', () => {
    expect(informationsGeneralesSoumises(sansSiret).lieuItinerant).toBe(true)
  })

  it('emporte le nom saisi librement', () => {
    expect(informationsGeneralesSoumises(sansSiret).nom).toBe(
      'Tiers-lieu du Port',
    )
  })
})

/**
 * Aucun champ ne l'édite — il vient des imports cartographiques — et ne pas le
 * renvoyer l'effacerait.
 */
describe('le RNA', () => {
  it.each([[true], [false]])(
    'repart tel qu’il est venu (sans SIRET : %s)',
    (noSiret) => {
      expect(
        informationsGeneralesSoumises(
          formulaire({ noSiret, rna: 'W123456789' }),
        ).rna,
      ).toBe('W123456789')
    },
  )
})

/** Dans les deux cas, l'adresse a été reconnue par la Base Adresse Nationale. */
describe('l’adresse', () => {
  it('est celle que la BAN a validée', () => {
    expect(informationsGeneralesSoumises(formulaire()).adresseBan).toBe(
      adresseBan,
    )
  })
})
