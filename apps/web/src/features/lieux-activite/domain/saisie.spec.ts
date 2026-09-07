import { emptyOpeningHours } from '@app/web/opening-hours/openingHoursHelpers'
import {
  Itinerance,
  ModaliteAcces,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Schedule } from '@gouvfr-anct/timetable-to-osm-opening-hours'
import {
  adresseSaisie,
  courrielsSaisis,
  courrielsValides,
  horairesSaisis,
  itineranceSaisie,
  localisationSaisie,
  modalitesAccesSaisies,
  nonVide,
  pivotSaisi,
  presentationSaisie,
  sitesWebSaisis,
  telephoneSaisi,
  telephoneValide,
  urlSaisie,
} from './saisie'

const ban = {
  nom: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
  latitude: 45.94,
  longitude: -0.96,
}

describe('le numéro de téléphone', () => {
  /**
   * La forme canonique est l'E.164 : c'est la seule sous laquelle deux
   * écritures d'un même numéro se reconnaissent.
   */
  it.each([
    ['01 02 03 04 05', '+33102030405'],
    ['01.02.03.04.05', '+33102030405'],
    ['0102030405', '+33102030405'],
    ['+33 1 02 03 04 05', '+33102030405'],
    ['(+33) 1 02 03 04 05', '+33102030405'],
    ['0033102030405', '+33102030405'],
    ['+33102030405', '+33102030405'],
  ])('se normalise : %s devient %s', (saisi, canonique) => {
    expect(telephoneValide(saisi)).toBe(canonique)
  })

  /**
   * Les DOM partagent le format national de la métropole mais relèvent d'un
   * indicatif pays distinct : les lire comme métropolitains donnerait
   * `+33262…`, qui ne désigne personne.
   */
  it.each([
    ['02 62 20 20 20', '+262262202020'],
    ['0269600102', '+262269600102'],
    ['06 90 00 00 01', '+590690000001'],
  ])(
    'donne son indicatif à l’outre-mer : %s devient %s',
    (saisi, canonique) => {
      expect(telephoneValide(saisi)).toBe(canonique)
    },
  )

  /** Un lieu paraît sur la cartographie nationale, qui n'admet que la France. */
  it('refuse un numéro étranger, fût-il valide', () => {
    expect(telephoneValide('+32 470 44 25 43')).toBeNull()
  })

  it.each([['12'], ['poste 1234'], [''], [null], [undefined]])(
    'refuse %s',
    (saisi) => {
      expect(telephoneValide(saisi)).toBeNull()
    },
  )

  /** La case commande le champ : décochée, le numéro saisi ne part pas. */
  it('n’est retenu que si sa case est cochée', () => {
    expect(telephoneSaisi(false, '01 02 03 04 05')).toBeNull()
    expect(telephoneSaisi(true, '01 02 03 04 05')).toBe('+33102030405')
  })
})

describe('les horaires', () => {
  const lundiMatin: Schedule = {
    ...emptyOpeningHours,
    Mo: {
      am: { startTime: '09:00', endTime: '12:00', isOpen: true },
      pm: { startTime: null, endTime: null, isOpen: false },
    },
  }

  it('se composent en une chaîne OpenStreetMap', () => {
    expect(horairesSaisis(lundiMatin, null)).toBe('Mo 09:00-12:00')
  })

  /**
   * `appendComment` ajoute plutôt qu'il ne remplace : composer deux fois — une
   * fois en projetant la saisie, une fois dans le mapper — écrivait le
   * commentaire en double.
   */
  it('portent leur commentaire une seule fois', () => {
    expect(horairesSaisis(lundiMatin, 'Fermé le premier lundi')).toBe(
      'Mo 09:00-12:00 "Fermé le premier lundi"',
    )
  })

  it('valent null quand la grille est vide et qu’il n’y a rien à commenter', () => {
    expect(horairesSaisis(emptyOpeningHours, null)).toBeNull()
    expect(horairesSaisis(emptyOpeningHours, '   ')).toBeNull()
  })
})

describe('l’immatriculation', () => {
  it('retient le SIRET quand il en est un', () => {
    expect(pivotSaisi('13002603200016', null)).toBe('13002603200016')
  })

  it('retombe sur le RNA à défaut de SIRET', () => {
    expect(pivotSaisi(null, 'W123456789')).toBe('W123456789')
  })

  it('préfère le SIRET quand les deux sont là', () => {
    expect(pivotSaisi('13002603200016', 'W123456789')).toBe('13002603200016')
  })

  it.each([
    ['123', null],
    [null, 'pas-un-rna'],
    [null, null],
  ])('vaut null pour (%s, %s)', (siret, rna) => {
    expect(pivotSaisi(siret, rna)).toBeNull()
  })
})

describe('les adresses web', () => {
  it('reconnaît une URL', () => {
    expect(urlSaisie('https://example.fr')).toBe('https://example.fr')
  })

  it.each([['coucou'], [''], [null]])('écarte %s', (valeur) => {
    expect(urlSaisie(valeur)).toBeNull()
  })

  /** Le schéma national joint plusieurs sites web par « | ». */
  it('découpe la liste du schéma national', () => {
    expect(sitesWebSaisis('https://un.fr|https://deux.fr')).toEqual([
      'https://un.fr',
      'https://deux.fr',
    ])
  })

  it('écarte de la liste ce qui n’est pas une URL', () => {
    expect(sitesWebSaisis('https://un.fr|coucou')).toEqual(['https://un.fr'])
  })

  it('rend une liste vide pour une saisie vide', () => {
    expect(sitesWebSaisis(null)).toEqual([])
  })
})

describe('les courriels', () => {
  it('ne retient que les adresses reconnues, dans l’ordre', () => {
    expect(
      courrielsValides(['premier@example.fr', 'pas-une-adresse', null]),
    ).toEqual(['premier@example.fr'])
  })

  it('n’en retient aucun si la case n’est pas cochée', () => {
    expect(courrielsSaisis(false, 'contact@example.fr')).toEqual([])
  })
})

describe('la présentation', () => {
  it('ne garde que ce qui est renseigné', () => {
    expect(presentationSaisie('Un résumé', '   ')).toEqual({
      resume: 'Un résumé',
    })
  })

  it('vaut null quand ni résumé ni détail ne sont renseignés', () => {
    expect(presentationSaisie(null, '')).toBeNull()
  })
})

describe('l’itinérance', () => {
  it.each([
    [true, [Itinerance.Itinerant]],
    [false, [Itinerance.Fixe]],
    [null, []],
  ])('se dit en liste : %s devient %s', (itinerant, attendu) => {
    expect(itineranceSaisie(itinerant)).toEqual(attendu)
  })
})

describe('les modalités d’accès', () => {
  it('sont celles dont la case est cochée', () => {
    expect(
      modalitesAccesSaisies({
        surPlace: true,
        parTelephone: false,
        parMail: true,
      }),
    ).toEqual([ModaliteAcces.SePresenter, ModaliteAcces.ContacterParMail])
  })
})

describe('l’adresse', () => {
  it('se compose depuis l’adresse reconnue par la BAN', () => {
    expect(adresseSaisie(ban, 'Bâtiment B')).toEqual({
      voie: '12 quai du Port',
      commune: 'Rochefort',
      code_postal: '17300',
      code_insee: '17299',
      complement_adresse: 'Bâtiment B',
    })
  })

  it('se passe du complément quand il est vide', () => {
    expect(adresseSaisie(ban, '  ')).not.toHaveProperty('complement_adresse')
  })

  it('porte la localisation de la BAN', () => {
    expect(localisationSaisie(ban)).toEqual({
      latitude: 45.94,
      longitude: -0.96,
    })
  })
})

describe('une valeur non vide', () => {
  it.each([
    ['  du texte  ', 'du texte'],
    ['   ', null],
    ['', null],
    [null, null],
    [undefined, null],
  ])('%s devient %s', (valeur, attendu) => {
    expect(nonVide(valeur)).toBe(attendu)
  })
})
