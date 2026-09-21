import { diagnostiquer, type LigneAAuditer } from './anomalie'
import { auditerLesDonnees } from './auditer-les-donnees'

const ligne = (champs: Partial<LigneAAuditer> = {}): LigneAAuditer => ({
  id: 'e4b5f0d4-5a1f-4a5a-9a4e-2e1c9f0b1d2c',
  nom: 'Espace numérique de Reims',
  siret: '13002603200016',
  rna: null,
  adresse: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  complementAdresse: null,
  banId: '51454_7160_00012',
  latitude: 49.25,
  longitude: 4.03,
  telephone: null,
  courriels: [],
  siteWeb: null,
  horaires: null,
  presentationResume: null,
  presentationDetail: null,
  ficheAccesLibre: null,
  priseRdv: null,
  typologies: ['TIERS_LIEUX'],
  services: ['Aide aux démarches administratives'],
  modalitesAcces: [],
  modalitesAccompagnement: [],
  publicsSpecifiquementAdresses: [],
  priseEnChargeSpecifique: [],
  fraisACharge: [],
  itinerance: [],
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: [],
  visiblePourCartographieNationale: true,
  ...champs,
})

const codes = (champs: Partial<LigneAAuditer>): string[] =>
  diagnostiquer(ligne(champs)).map(({ code }) => code)

describe('le diagnostic d’une ligne', () => {
  it('ne reproche rien à une ligne que les règles acceptent', () => {
    expect(diagnostiquer(ligne())).toEqual([])
  })

  /**
   * Ce que la montée en 4.2.0 a resserré sans que le compilateur puisse le
   * dire : la voie a perdu l'esperluette, et le complément est désormais mesuré
   * au jeu de caractères d'un nom de voie.
   */
  it.each([
    ['12 rue Pierre & Marie Curie'],
    ['12 rue A + B'],
    ['Rue des Écoles – prolongement'],
    ['12345'],
  ])('signale la voie « %s », que la base acceptait', (adresse) => {
    expect(codes({ adresse })).toContain('voie-non-reconnue')
  })

  /**
   * Une adresse ne se stocke que si elle vient de la Base Adresse Nationale.
   * Un identifiant absent, ou qui désigne une autre commune que celle
   * enregistrée, dit que ce n'est pas le cas.
   */
  it('signale une adresse sans identifiant BAN', () => {
    expect(codes({ banId: null })).toEqual(['adresse-hors-ban'])
  })

  it('signale un identifiant BAN qui contredit la commune', () => {
    expect(codes({ banId: '70058_0170_00004' })).toEqual([
      'ban-id-contredit-la-commune',
    ])
  })

  it.each([
    ['Paris', '75056', '75113_1234_00001'],
    ['Lyon', '69123', '69386_1234_00001'],
    ['Marseille', '13055', '13208_1234_00001'],
  ])(
    'accepte l’arrondissement que la BAN nomme à %s',
    (_ville, codeInsee, banId) => {
      expect(codes({ codeInsee, banId })).toEqual([])
    },
  )

  it('accepte la casse de l’identifiant corse', () => {
    expect(codes({ codeInsee: '2B313', banId: '2b313_0010_00001' })).toEqual([])
  })

  it('signale un complément hors du jeu de caractères', () => {
    expect(codes({ complementAdresse: 'Appt #4' })).toEqual([
      'complement-non-reconnu',
    ])
  })

  it.each([
    ['code postal', { codePostal: '99999' }, 'code-postal-invalide'],
    ['code INSEE', { codeInsee: '99123' }, 'code-insee-invalide'],
    ['SIRET', { siret: '55217862900132' }, 'siret-invalide'],
    ['téléphone', { telephone: '+32 470 44 25 43' }, 'telephone-non-conforme'],
    ['courriel', { courriels: ['pas-une-adresse'] }, 'courriel-non-conforme'],
    ['horaires', { horaires: 'tous les jours' }, 'horaires-non-osm'],
    [
      'fiche d’accessibilité',
      { ficheAccesLibre: 'https://example.fr' },
      'fiche-hors-acces-libre',
    ],
    ['résumé', { presentationResume: 'x'.repeat(281) }, 'resume-trop-long'],
  ])('signale %s', (_nom, champs, attendu) => {
    expect(codes(champs)).toContain(attendu)
  })

  it('signale chaque site web fautif d’une liste jointe, pas la liste', () => {
    expect(
      codes({ siteWeb: 'https://un.example.fr|pas une url|https://w' }),
    ).toEqual(['site-web-non-conforme', 'site-web-non-conforme'])
  })

  it('signale un RNA devenu orphelin faute de SIRET', () => {
    expect(codes({ siret: null, rna: 'W751234567' })).toEqual([
      'pivot-etait-un-rna',
    ])
  })

  it('signale une liste en doublon et une liste désordonnée', () => {
    expect(
      codes({
        services: [
          'Aide aux démarches administratives',
          'Aide aux démarches administratives',
        ],
      }),
    ).toEqual(['liste-en-doublon'])
    expect(
      codes({
        services: [
          'Utilisation sécurisée du numérique',
          'Aide aux démarches administratives',
        ],
      }),
    ).toEqual(['liste-desordonnee'])
  })

  it('ne reproche rien aux listes d’un lieu non publié', () => {
    expect(
      codes({
        typologies: [],
        services: [],
        visiblePourCartographieNationale: false,
      }),
    ).toEqual([])
  })
})

describe('le relevé', () => {
  it('compte les lieux touchés, pas les anomalies', () => {
    const releve = auditerLesDonnees([
      ligne({ id: 'a', adresse: '12 rue A & B', codePostal: '99999' }),
      ligne({ id: 'b' }),
    ])

    expect(releve.lieuxAudites).toBe(2)
    expect(releve.lieuxSains).toBe(1)
    expect(releve.lieuxEcartes).toBe(1)
    expect(releve.postes.map(({ code }) => code).sort()).toEqual([
      'code-postal-invalide',
      'voie-non-reconnue',
    ])
  })

  it('range les postes du plus lourd au plus léger', () => {
    const releve = auditerLesDonnees([
      ligne({ id: 'a', codePostal: '99999' }),
      ligne({ id: 'b', codePostal: '99999' }),
      ligne({ id: 'c', horaires: 'tous les jours' }),
    ])

    expect(releve.postes.map(({ code, lieux }) => [code, lieux])).toEqual([
      ['code-postal-invalide', 2],
      ['horaires-non-osm', 1],
    ])
  })
})
