import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import {
  type AdresseGeocodee,
  adresseAReprendre,
  adresseSoumise,
  serviceDesigne,
  voieMuette,
} from './adresse-a-reprendre'

const RENDUE: AdresseGeocodee = {
  type: 'housenumber',
  score: 0.96,
  banId: '51454_7160_00012',
  voie: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  ancienCodeInsee: '',
  latitude: 49.25,
  longitude: 4.03,
  libelle: '12 rue de la Paix 51100 Reims',
}

const verdict = (
  rendue?: Partial<AdresseGeocodee>,
  lieu: Parameters<typeof lieuAReprendre>[0] = {},
) =>
  adresseAReprendre(
    lieuAReprendre(lieu),
    rendue === undefined ? [] : [{ ...RENDUE, ...rendue }],
  )

describe('le verdict sur l’adresse d’un lieu', () => {
  it('ne reproche rien à une adresse que la BAN rend à l’identique', () => {
    expect(verdict({})).toBeNull()
  })

  it('corrige une adresse dont l’identifiant BAN diffère', () => {
    expect(verdict({ banId: '51454_7160_00099' })).toEqual({
      verdict: 'a-corriger',
      adresse: { ...RENDUE, banId: '51454_7160_00099' },
    })
  })

  it('corrige une adresse dépourvue de coordonnées', () => {
    expect(verdict({}, { latitude: null, longitude: null })?.verdict).toBe(
      'a-corriger',
    )
  })

  it('ne corrige pas un repli sur le centre de la commune', () => {
    expect(verdict({ type: 'municipality' })).toEqual({
      verdict: 'a-verifier',
      motif: 'la voie est introuvable',
    })
  })

  it('ne corrige pas un appariement faible sur une autre voie', () => {
    expect(verdict({ score: 0.899, voie: 'Rue de Bourgogne' })).toEqual({
      verdict: 'a-verifier',
      motif: 'score insuffisant',
    })
  })

  it('corrige un appariement faible sur la même voie, au même point', () => {
    expect(verdict({ score: 0.899, banId: 'autre' })?.verdict).toBe(
      'a-corriger',
    )
  })

  it('retient un appariement tout juste au seuil', () => {
    expect(verdict({ score: 0.9, banId: 'autre' })?.verdict).toBe('a-corriger')
  })

  it('signale une adresse dont la BAN ne rend rien', () => {
    expect(verdict(undefined)).toEqual({
      verdict: 'a-verifier',
      motif: 'la Base Adresse Nationale ne rend rien',
    })
  })
})

describe('le lieu qu’aucune adresse ne situe et qui n’accompagne personne', () => {
  const sansAccompagnement = (rendue?: Partial<AdresseGeocodee>) =>
    verdict(rendue, { accompagnements: 0 })

  it('se supprime quand la BAN ne reconnaît pas sa voie', () => {
    expect(sansAccompagnement({ type: 'municipality' })).toEqual({
      verdict: 'a-supprimer',
      motif: 'la voie est introuvable',
    })
  })

  it('se supprime quand la BAN ne rend rien', () => {
    expect(sansAccompagnement(undefined)).toEqual({
      verdict: 'a-supprimer',
      motif: 'la Base Adresse Nationale ne rend rien',
    })
  })

  it('reste à vérifier dès qu’il a accompagné quelqu’un', () => {
    expect(verdict({ type: 'municipality' }, { accompagnements: 1 })).toEqual({
      verdict: 'a-verifier',
      motif: 'la voie est introuvable',
    })
  })

  it('ne se supprime pas quand son adresse se corrige', () => {
    expect(verdict({ banId: 'autre' }, { accompagnements: 0 })?.verdict).toBe(
      'a-corriger',
    )
  })

  it('ne se supprime pas quand son adresse est déjà conforme', () => {
    expect(verdict({}, { accompagnements: 0 })).toBeNull()
  })
})

describe('la commune, que la BAN ne code pas toujours comme nous', () => {
  it('reconnaît l’arrondissement que la BAN rend pour la ville', () => {
    expect(
      verdict({ codeInsee: '75110', banId: 'autre' }, { codeInsee: '75056' })
        ?.verdict,
    ).toBe('a-corriger')
  })

  it('reconnaît la ville que la BAN rend pour l’arrondissement', () => {
    expect(
      verdict({ codeInsee: '13055', banId: 'autre' }, { codeInsee: '13203' })
        ?.verdict,
    ).toBe('a-corriger')
  })

  it('reconnaît la commune nouvelle dont la BAN rend l’ancien code', () => {
    expect(
      verdict({
        codeInsee: '85292',
        ancienCodeInsee: '51454',
        banId: 'autre',
      })?.verdict,
    ).toBe('a-corriger')
  })

  it('refuse une voie trouvée dans une commune sans rapport', () => {
    expect(verdict({ codeInsee: '51108' })).toEqual({
      verdict: 'a-verifier',
      motif: 'une autre commune que celle enregistrée',
    })
  })

  it('refuse l’arrondissement d’une autre ville', () => {
    expect(
      verdict({ codeInsee: '75110', banId: 'autre' }, { codeInsee: '13055' })
        ?.verdict,
    ).toBe('a-verifier')
  })
})

describe('le lieu-dit, adresse entière là où il n’y a pas de voie', () => {
  it('retient un lieu-dit que la BAN reconnaît', () => {
    expect(
      verdict(
        { type: 'locality', voie: 'Le Bourg', banId: 'autre' },
        { adresse: 'Le Bourg' },
      )?.verdict,
    ).toBe('a-corriger')
  })

  it('refuse un lieu-dit dont la BAN n’est pas sûre', () => {
    expect(
      verdict(
        { type: 'locality', voie: 'La Fage', score: 0.5, banId: 'autre' },
        { adresse: 'Le Bourg' },
      ),
    ).toEqual({ verdict: 'a-verifier', motif: 'score insuffisant' })
  })
})

describe('les deux façons d’interroger la Base Adresse Nationale', () => {
  const entre = (...rendues: Partial<AdresseGeocodee>[]) =>
    adresseAReprendre(
      lieuAReprendre({ adresse: 'Route de Marseille' }),
      rendues.map((rendue) => ({ ...RENDUE, ...rendue })),
    )

  it('garde la réponse la mieux notée', () => {
    expect(
      entre(
        { voie: 'Route de Lyon', score: 0.55, banId: 'avec' },
        { voie: 'Route de Marseille', score: 0.97, banId: 'sans' },
      ),
    ).toEqual({
      verdict: 'a-corriger',
      adresse: {
        ...RENDUE,
        voie: 'Route de Marseille',
        score: 0.97,
        banId: 'sans',
      },
    })
  })

  it('se rabat sur la seconde quand la mieux notée ne tient pas', () => {
    expect(
      entre(
        { type: 'municipality', score: 0.98, banId: 'avec' },
        { voie: 'Route de Marseille', score: 0.93, banId: 'sans' },
      )?.verdict,
    ).toBe('a-corriger')
  })

  it('signale le motif de la mieux notée quand aucune ne tient', () => {
    expect(
      entre(
        { type: 'municipality', score: 0.98 },
        { voie: 'Route de Lyon', score: 0.55 },
      ),
    ).toEqual({ verdict: 'a-verifier', motif: 'la voie est introuvable' })
  })
})

describe('les mots d’une voie contenus dans ceux de l’autre', () => {
  const auPoint = (adresse: string, voie: string, metres: number) =>
    adresseAReprendre(lieuAReprendre({ adresse }), [
      {
        ...RENDUE,
        score: 0.6,
        voie,
        banId: 'autre',
        latitude: 49.25 + metres / 111_320,
      },
    ])

  it('retient la voie que la saisie noyait dans le nom du bâtiment', () => {
    expect(
      auPoint(
        '32 RUE FREDERIC MISTRAL LA STATION',
        '32 Rue Frédéric Mistral',
        0,
      )?.verdict,
    ).toBe('a-corriger')
  })

  it('retient le prénom que la BAN ajoute', () => {
    expect(auPoint('5 Rue Surcouf', '5 Rue Robert Surcouf', 0)?.verdict).toBe(
      'a-corriger',
    )
  })

  it('refuse les mêmes mots à cent mètres', () => {
    expect(
      auPoint(
        '32 RUE FREDERIC MISTRAL LA STATION',
        '32 Rue Frédéric Mistral',
        100,
      ),
    ).toEqual({ verdict: 'a-verifier', motif: 'score insuffisant' })
  })

  it('refuse une voie qui ne partage pas ses mots', () => {
    expect(auPoint('Route de Marseille', 'Route de Lyon', 0)).toEqual({
      verdict: 'a-verifier',
      motif: 'score insuffisant',
    })
  })
})

describe('la voie soumise à la Base Adresse Nationale', () => {
  it.each([
    [
      'ce qui précède le type de voie',
      'Hotel de Ville 7 Rue Andre Gide',
      '7 Rue Andre Gide',
    ],
    [
      'la zone d’activité',
      'ZA STANG AR GARRONT 9 RUE CAMILLE DANGUILLAUME',
      '9 RUE CAMILLE DANGUILLAUME',
    ],
    [
      'la lettre isolée après le numéro',
      '5 T RUE JEAN COTTIN',
      '5 RUE JEAN COTTIN',
    ],
    [
      'le second numéro de la fourchette',
      '39-41 Rue de l’Esterel',
      '39 Rue de l’Esterel',
    ],
    ['la boîte postale', 'BP 117 2 Avenue du Parc', '2 Avenue du Parc'],
    [
      'le code postal et la commune recopiés',
      '26 Rue Famelart 59200 Tourcoing',
      '26 Rue Famelart',
    ],
    [
      'une abréviation de type de voie',
      '10 PL DE L HOTEL DE VILLE',
      '10 Place DE L HOTEL DE VILLE',
    ],
  ])('se débarrasse de %s', (_cas, brute, attendue) => {
    expect(adresseSoumise(lieuAReprendre({ adresse: brute })).voie).toBe(
      attendue,
    )
  })

  it('laisse intacte une voie qui n’a rien de trop', () => {
    expect(
      adresseSoumise(lieuAReprendre({ adresse: '12 rue de la Paix' })).voie,
    ).toBe('12 rue de la Paix')
  })
})

const RETROUVEE = { ...RENDUE, distance: 0, voieSansLeNumero: RENDUE.voie }

const parLesCoordonnees = (
  retrouvee?: Partial<typeof RETROUVEE>,
  lieu: Parameters<typeof lieuAReprendre>[0] = {},
) =>
  adresseAReprendre(
    lieuAReprendre({ adresse: 'Vallon-en-Sully', ...lieu }),
    [{ ...RENDUE, type: 'municipality' }],
    retrouvee === undefined ? undefined : { ...RETROUVEE, ...retrouvee },
  )

describe('l’adresse retrouvée au point du lieu', () => {
  it('rattrape une voie que la Base Adresse Nationale ne reconnaît pas', () => {
    expect(parLesCoordonnees({ banId: 'autre' })).toEqual({
      verdict: 'a-corriger',
      adresse: { ...RETROUVEE, banId: 'autre' },
    })
  })

  it('accepte un point tout juste à la limite', () => {
    expect(parLesCoordonnees({ distance: 25, banId: 'autre' })?.verdict).toBe(
      'a-corriger',
    )
  })

  it('refuse un point trop éloigné de l’adresse rendue', () => {
    expect(parLesCoordonnees({ distance: 26 })).toEqual({
      verdict: 'a-verifier',
      motif: 'la voie est introuvable',
    })
  })

  it('refuse une adresse trouvée dans une autre commune', () => {
    expect(parLesCoordonnees({ codeInsee: '51108' })?.verdict).toBe(
      'a-verifier',
    )
  })

  it('refuse un repli sur le centre de la commune', () => {
    expect(parLesCoordonnees({ type: 'municipality' })?.verdict).toBe(
      'a-verifier',
    )
  })

  it('ne sert pas quand l’adresse écrite suffit', () => {
    expect(
      adresseAReprendre(lieuAReprendre(), [RENDUE], {
        ...RETROUVEE,
        banId: 'ailleurs',
      }),
    ).toBeNull()
  })

  it('ne concerne pas un lieu sans coordonnées', () => {
    expect(parLesCoordonnees(undefined)?.verdict).toBe('a-verifier')
  })
})

describe('la voie écrite, que le point confirme sans la remplacer', () => {
  const auPoint = (adresse: string, retrouvee: Partial<typeof RETROUVEE>) =>
    adresseAReprendre(
      lieuAReprendre({ adresse }),
      [{ ...RENDUE, type: 'municipality' }],
      { ...RETROUVEE, banId: 'autre', distance: 3, ...retrouvee },
    )

  it('confirme la voie dont le point porte les mêmes mots', () => {
    expect(
      auPoint('82 Rue Guynemer', {
        type: 'street',
        voie: 'Rue Guynemer',
        voieSansLeNumero: 'Rue Guynemer',
      })?.verdict,
    ).toBe('a-corriger')
  })

  it('confirme la voie dont le point ne diffère que par l’orthographe', () => {
    expect(
      auPoint('Rue Macabit', {
        type: 'street',
        voie: 'Rue des Macabits',
        voieSansLeNumero: 'Rue des Macabits',
      })?.verdict,
    ).toBe('a-corriger')
  })

  it('ne laisse pas le point remplacer une voie qui parle', () => {
    expect(
      auPoint('Route de Marseille', {
        type: 'street',
        voie: 'Route de Lyon',
        voieSansLeNumero: 'Route de Lyon',
      }),
    ).toEqual({ verdict: 'a-verifier', motif: 'la voie est introuvable' })
  })

  it('compare la voie sans son numéro', () => {
    expect(
      auPoint('Rue de la Chapelle', {
        voie: '9 Rue de la Chapelle',
        voieSansLeNumero: 'Rue de la Chapelle',
      })?.verdict,
    ).toBe('a-corriger')
  })
})

describe('la voie qui se tait, seule à laisser parler le point', () => {
  it.each([
    ['une voie vide', ''],
    ['une voie réduite à des blancs', '   '],
    ['le nom de la commune', 'Reims'],
    ['un lieu-dit sans type de voie', 'Metairie Loaven'],
    ['un nom de bâtiment', 'Maison De Pays'],
  ])('se tait quand elle porte %s', (_cas, adresse) => {
    expect(voieMuette(lieuAReprendre({ adresse }))).toBe(true)
  })

  it.each([
    ['une rue', '12 rue de la Paix'],
    ['un boulevard en capitales', '45 BOULEVARD DE STRASBOURG'],
    ['un chemin sans numéro', 'Chemin Abel Labonne'],
    ['une place abrégée', "1 PL D'ARMES"],
  ])('parle quand elle porte %s', (_cas, adresse) => {
    expect(voieMuette(lieuAReprendre({ adresse }))).toBe(false)
  })
})

describe('le numéro de voie, que seule la proximité autorise à perdre', () => {
  const aLaVoie = (metres: number) =>
    adresseAReprendre(lieuAReprendre({ adresse: '20 Route de Demigny' }), [
      {
        ...RENDUE,
        type: 'street',
        voie: 'Route de Demigny',
        banId: 'autre',
        latitude: 49.25 + metres / 111_320,
      },
    ])

  it('accepte de perdre le numéro au point même du lieu', () => {
    expect(aLaVoie(0)?.verdict).toBe('a-corriger')
  })

  it('refuse de le perdre pour une voie située ailleurs', () => {
    expect(aLaVoie(300)).toEqual({
      verdict: 'a-verifier',
      motif: 'le numéro de voie serait perdu',
    })
  })

  it('accepte une adresse « à la voie » là où la nôtre n’a pas de numéro', () => {
    expect(
      verdict(
        { type: 'street', voie: 'Route de Demigny', banId: 'autre' },
        { adresse: 'Route de Demigny' },
      )?.verdict,
    ).toBe('a-corriger')
  })

  it('accepte le numéro que la BAN ajoute au point du lieu', () => {
    expect(
      verdict(
        { voie: '14 Route de Demigny', banId: 'autre' },
        { adresse: 'Route de Demigny' },
      )?.verdict,
    ).toBe('a-corriger')
  })
})

describe('le rapprochement, quand la Base Adresse Nationale doute', () => {
  const auPoint = (adresse: string, voie: string, metres: number) =>
    adresseAReprendre(
      lieuAReprendre({ adresse, latitude: 49.25, longitude: 4.03 }),
      [
        {
          ...RENDUE,
          score: 0.8,
          voie,
          banId: 'autre',
          latitude: 49.25 + metres / 111_320,
          longitude: 4.03,
        },
      ],
    )

  it('retient une voie mal qualifiée au même point', () => {
    expect(
      auPoint('1 Place Victor Schoelcher', '1 Rue Victor Schoelcher', 0)
        ?.verdict,
    ).toBe('a-corriger')
  })

  it('refuse la même ressemblance à cent mètres', () => {
    expect(
      auPoint('1 Place Victor Schoelcher', '1 Rue Victor Schoelcher', 100),
    ).toEqual({ verdict: 'a-verifier', motif: 'score insuffisant' })
  })

  it('ne se substitue pas au score quand celui-ci suffit', () => {
    expect(
      verdict(
        { voie: 'Route de Marseille', banId: 'autre' },
        { adresse: 'Route de Marseille' },
      )?.verdict,
    ).toBe('a-corriger')
  })
})

describe('le service public que le nom du lieu désigne', () => {
  it.each([
    ['Mairie d’Oyrières', 'mairie'],
    ['COMMUNE DU LORRAIN', 'mairie'],
    ['Hôtel de Ville de Vivario', 'mairie'],
    ['CCAS de Millas', 'ccas'],
    ['Centre communal d’action sociale', 'ccas'],
    ['Espaces France Services Cunlhat', 'france_services'],
    ['MFS Saulx', 'france_services'],
    ['Maison des solidarités de Bonne', 'mds'],
  ])('reconnaît %s', (nom, service) => {
    expect(serviceDesigne(nom)).toBe(service)
  })

  it.each([
    ['une mairie annexe', 'Mairie Annexe Saint-Germain-de-Confolens'],
    ['une mairie déléguée', 'Mairie déléguée de Seynod'],
    ['une salle de la mairie', 'MAIRIE salle de la FRATERNITE'],
    ['une intercommunalité', 'Communauté de communes du Pays de Sommières'],
    ['un centre intercommunal', 'Centre intercommunal d’action sociale'],
    ['un lieu qui n’est pas un service public', 'Médiathèque de Donzy'],
  ])('ne désigne aucun service pour %s', (_cas, nom) => {
    expect(serviceDesigne(nom)).toBeNull()
  })
})

describe('l’adresse que l’Annuaire de l’administration donne à la BAN', () => {
  const DE_L_ANNUAIRE: AdresseGeocodee = {
    ...RENDUE,
    banId: '51454_0450_00001',
    voie: '1 Place de l’Hôtel de Ville',
  }

  const parLAnnuaire = (
    services: readonly (AdresseGeocodee | null)[],
    lieu: Parameters<typeof lieuAReprendre>[0] = {},
  ) =>
    adresseAReprendre(
      lieuAReprendre({ nom: 'Mairie de Reims', adresse: 'Reims', ...lieu }),
      [{ ...RENDUE, type: 'municipality' }],
      undefined,
      services,
    )

  it('situe le service que ni l’adresse ni le point ne situent', () => {
    expect(parLAnnuaire([DE_L_ANNUAIRE])).toEqual({
      verdict: 'a-corriger-d-apres-l-annuaire',
      adresse: DE_L_ANNUAIRE,
    })
  })

  it('ne tranche pas entre deux services du même type', () => {
    expect(
      parLAnnuaire([DE_L_ANNUAIRE, { ...DE_L_ANNUAIRE, banId: 'autre' }])
        ?.verdict,
    ).toBe('a-verifier')
  })

  it('ne retient pas un service que la BAN ne situe pas', () => {
    expect(parLAnnuaire([null])?.verdict).toBe('a-verifier')
  })

  it('ne retient pas un appariement faible', () => {
    expect(parLAnnuaire([{ ...DE_L_ANNUAIRE, score: 0.89 }])?.verdict).toBe(
      'a-verifier',
    )
  })

  it('ne retient pas une adresse dans une autre commune', () => {
    expect(
      parLAnnuaire([{ ...DE_L_ANNUAIRE, codeInsee: '51108' }])?.verdict,
    ).toBe('a-verifier')
  })

  it('ne remplace pas une voie écrite', () => {
    expect(
      parLAnnuaire([DE_L_ANNUAIRE], { adresse: 'Rue du Grand Cadi' })?.verdict,
    ).toBe('a-verifier')
  })

  it('confirme une voie écrite qu’il porte aussi', () => {
    expect(
      parLAnnuaire([DE_L_ANNUAIRE], { adresse: 'Place de l’Hôtel de Ville' })
        ?.verdict,
    ).toBe('a-corriger-d-apres-l-annuaire')
  })

  it('ne perd pas le numéro de la voie écrite', () => {
    expect(
      parLAnnuaire(
        [{ ...DE_L_ANNUAIRE, type: 'street', voie: 'Rue de la Paix' }],
        {
          adresse: '4 rue de la Paix',
        },
      )?.verdict,
    ).toBe('a-verifier')
  })

  it('sauve de la suppression le lieu qui n’a accompagné personne', () => {
    expect(parLAnnuaire([DE_L_ANNUAIRE], { accompagnements: 0 })?.verdict).toBe(
      'a-corriger-d-apres-l-annuaire',
    )
  })

  it('passe après l’adresse écrite', () => {
    expect(
      adresseAReprendre(lieuAReprendre(), [RENDUE], undefined, [DE_L_ANNUAIRE]),
    ).toBeNull()
  })
})
