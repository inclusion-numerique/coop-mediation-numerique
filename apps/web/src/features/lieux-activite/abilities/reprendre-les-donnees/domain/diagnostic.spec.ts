import { diagnostiquer } from './diagnostic'
import type { LieuAReprendre } from './lieu-a-reprendre'
import { lieuAReprendre } from './lieu-a-reprendre.fixture'

const motifs = (champs: Partial<LieuAReprendre>): string[] =>
  diagnostiquer(lieuAReprendre(champs)).map(({ code }) => code)

describe('le diagnostic d’un lieu', () => {
  it('ne reproche rien à un lieu que les règles acceptent', () => {
    expect(diagnostiquer(lieuAReprendre())).toEqual([])
  })

  it.each([
    ['12 rue Pierre & Marie Curie'],
    ['12 rue A + B'],
    ['Rue des Écoles – prolongement'],
    ['12345'],
  ])('signale la voie « %s », que la base acceptait', (adresse) => {
    expect(motifs({ adresse })).toContain('voie-non-reconnue')
  })

  it('signale une adresse sans identifiant BAN', () => {
    expect(motifs({ banId: null })).toEqual(['adresse-hors-ban'])
  })

  it('signale un identifiant BAN qui contredit la commune', () => {
    expect(motifs({ banId: '70058_0170_00004' })).toEqual([
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
      expect(motifs({ codeInsee, banId })).toEqual([])
    },
  )

  it('accepte la casse de l’identifiant corse', () => {
    expect(motifs({ codeInsee: '2B313', banId: '2b313_0010_00001' })).toEqual(
      [],
    )
  })

  it.each([
    [
      'le complément d’adresse',
      { complementAdresse: 'Appt #4' },
      'complement-non-reconnu',
    ],
    ['le code postal', { codePostal: '99999' }, 'code-postal-invalide'],
    ['le code INSEE', { codeInsee: '99123' }, 'code-insee-invalide'],
    ['le SIRET', { siret: '55217862900132' }, 'siret-invalide'],
    [
      'le téléphone',
      { telephone: '+32 470 44 25 43' },
      'telephone-non-conforme',
    ],
    [
      'le courriel',
      { courriels: ['pas-une-adresse'] },
      'courriel-non-conforme',
    ],
    ['les horaires', { horaires: 'tous les jours' }, 'horaires-non-osm'],
    [
      'la fiche d’accessibilité',
      { ficheAccesLibre: 'https://example.fr' },
      'fiche-hors-acces-libre',
    ],
    ['le résumé', { presentationResume: 'x'.repeat(281) }, 'resume-trop-long'],
  ])('signale %s', (_nom, champs, attendu) => {
    expect(motifs(champs)).toContain(attendu)
  })

  it('signale chaque site web fautif, pas la liste', () => {
    expect(
      motifs({
        siteWeb: ['https://un.example.fr', 'pas une url', 'https://w'],
      }),
    ).toEqual(['site-web-non-conforme', 'site-web-non-conforme'])
  })

  it('signale un RNA devenu orphelin faute de SIRET', () => {
    expect(motifs({ siret: null, rna: 'W751234567' })).toEqual([
      'pivot-etait-un-rna',
    ])
  })

  it('signale une liste désordonnée', () => {
    expect(
      motifs({
        services: [
          'Utilisation sécurisée du numérique',
          'Aide aux démarches administratives',
        ],
      }),
    ).toEqual(['liste-desordonnee'])
  })

  it('signale une liste qui répète une valeur', () => {
    expect(
      motifs({
        services: [
          'Aide aux démarches administratives',
          'Aide aux démarches administratives',
        ],
      }),
    ).toEqual(['liste-desordonnee'])
  })

  it('ne reproche rien aux listes d’un lieu que personne ne voit', () => {
    expect(motifs({ typologies: [], services: [], publie: false })).toEqual([])
  })

  it('réclame une typologie et un service au lieu publié', () => {
    expect(motifs({ typologies: [], services: [], publie: true })).toEqual([
      'sans-typologie',
      'sans-service',
    ])
  })
})
