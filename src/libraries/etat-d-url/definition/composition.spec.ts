import { Page, PageSize, Search, Sort } from '@arckit/resultset'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { z } from 'zod'
import { composerLEtat } from './composition'
import { filtreDeChoix, filtreDeChoixUnique } from './filtre-de-choix'
import { filtreDePeriode } from './filtre-de-periode'
import { filtreDeRecherche } from './filtre-de-recherche'
import { pagination } from './pagination'
import { rechercheLibre } from './recherche-libre'
import { triParmi } from './tri-parmi'

const filtres = composerLEtat(
  filtreDePeriode,
  filtreDeChoix({
    titre: 'types',
    cle: 'types',
    choix: { individuel: 'Individuel', collectif: 'Collectif' },
  }),
  filtreDeChoixUnique({
    titre: 'source',
    cle: 'source',
    choix: { v1: 'Import', v2: 'Coop' },
  }),
  filtreDeRecherche({
    titre: 'lieux',
    cle: 'lieux',
    schema: z.string().regex(/^[a-z]+$/),
  }),
)

const page = (parametres: Record<string, string>) => ({
  chemin: '/activites',
  parametres,
})

describe('composition de filtres', () => {
  it('lit les valeurs typées de l’URL', () => {
    expect(
      filtres.charger(
        '?types=individuel,collectif&source=v1&lieux=a,b&du=2026-01-01&au=2026-01-31',
      ),
    ).toStrictEqual({
      du: new Date('2026-01-01'),
      au: new Date('2026-01-31'),
      types: ['individuel', 'collectif'],
      source: 'v1',
      lieux: ['a', 'b'],
    })
  })

  it('lit toutes les valeurs d’un paramètre répété', () => {
    expect(
      filtres.charger({ types: ['individuel', 'collectif'] }).types,
    ).toStrictEqual(['individuel', 'collectif'])
  })

  it('ignore les espaces et les éléments vides d’une liste', () => {
    expect(
      filtres.charger({ types: ' individuel, ,collectif ' }).types,
    ).toStrictEqual(['individuel', 'collectif'])
  })

  it('écarte une valeur hors de la liste d’un choix multiple', () => {
    expect(filtres.charger('?types=individuel,inconnu').types).toStrictEqual([
      'individuel',
    ])
  })

  it('écarte un identifiant que le schéma refuse', () => {
    expect(filtres.charger('?lieux=a,B2').lieux).toStrictEqual(['a'])
  })

  it('traduit les valeurs de l’URL en valeurs métier', () => {
    expect(
      composerLEtat(
        filtreDeChoix({
          titre: 'types',
          cle: 'types',
          choix: { Individuel: 'Individuel' },
          dansLURL: { Individuel: 'individuel' },
        }),
      ).charger('?types=individuel,Individuel').types,
    ).toStrictEqual(['Individuel'])
  })

  it('écrit les valeurs métier sous leur forme d’URL', () => {
    const filtresTraduits = composerLEtat(
      filtreDeChoix({
        titre: 'types',
        cle: 'types',
        choix: { Individuel: 'Individuel' },
        dansLURL: { Individuel: 'individuel' },
      }),
    )
    expect(
      filtresTraduits.adresse(
        { chemin: '/a', parametres: {} },
        { types: ['Individuel'] },
      ),
    ).toBe('/a?types=individuel')
  })

  it('ignore une valeur hors de la liste d’un choix unique', () => {
    expect(filtres.charger('?source=v3').source).toBeNull()
  })

  it('rend les valeurs par défaut quand l’URL est vide', () => {
    expect(filtres.charger('')).toStrictEqual({
      du: null,
      au: null,
      types: [],
      source: null,
      lieux: [],
    })
  })

  it('donne à chaque valeur choisie une étiquette qui la retire', () => {
    const parametres = {
      types: 'individuel,collectif',
      lieux: 'a',
      lignes: '20',
      page: '3',
    }
    expect(
      filtres.etiquettes(page(parametres), filtres.charger(parametres), {
        lieux: new Map([['a', 'Médiathèque']]),
      }),
    ).toStrictEqual([
      {
        titre: 'types',
        prefixe: '',
        libelle: 'Individuel',
        href: '/activites?types=collectif&lieux=a&lignes=20',
      },
      {
        titre: 'types',
        prefixe: '',
        libelle: 'Collectif',
        href: '/activites?types=individuel&lieux=a&lignes=20',
      },
      {
        titre: 'lieux',
        prefixe: '',
        libelle: 'Médiathèque',
        href: '/activites?types=individuel,collectif&lignes=20',
      },
    ])
  })

  it('étiquette la période et le choix unique', () => {
    const parametres = { du: '2026-01-01', au: '2026-01-31', source: 'v2' }
    expect(
      filtres
        .etiquettes(page(parametres), filtres.charger(parametres))
        .map(({ libelle }) => libelle),
    ).toStrictEqual(['01/01/2026 - 31/01/2026', 'Coop'])
  })

  it('affiche l’identifiant d’une valeur cherchée dont le libellé est inconnu', () => {
    const parametres = { lieux: 'inconnu' }
    expect(
      filtres.etiquettes(page(parametres), filtres.charger(parametres)).at(0)
        ?.libelle,
    ).toBe('inconnu')
  })

  it('retire tous les filtres et la page, mais garde le reste', () => {
    expect(
      filtres.sansFiltres(
        page({ types: 'individuel', lignes: '20', page: '2' }),
      ),
    ).toBe('/activites?lignes=20')
  })

  it('rend la requête des seuls filtres', () => {
    const parametres = { types: 'collectif', page: '2', lignes: '20' }
    expect(filtres.requete(filtres.charger(parametres))).toBe('types=collectif')
  })

  it('rend les paramètres des seuls filtres', () => {
    const parametres = { types: 'collectif', source: 'v1', page: '2' }
    expect(filtres.parametresDe(filtres.charger(parametres))).toStrictEqual({
      types: 'collectif',
      source: 'v1',
    })
  })

  it('construit l’adresse d’une autre page avec les mêmes filtres', () => {
    const parametres = { types: 'collectif', page: '2' }
    expect(
      filtres.adresse(
        { chemin: '/activites/export', parametres },
        filtres.charger(parametres),
      ),
    ).toBe('/activites/export?types=collectif')
  })
})

const triDesLieux = triParmi({
  colonnes: ['nom', 'creation'],
  parDefaut: Sort('nom', 'asc'),
})

const paginationDesLieux = pagination({ lignes: [10, 20, 50], parDefaut: 20 })

const filtreDesTypes = filtreDeChoix({
  titre: 'Type',
  cle: 'types',
  choix: { individuel: 'Individuel', collectif: 'Collectif' },
})

const liste = composerLEtat(
  rechercheLibre,
  filtreDesTypes,
  triDesLieux,
  paginationDesLieux,
)

const adresse = (parametres: Record<string, string>) => ({
  chemin: '/lieux',
  parametres,
})

describe('lecture de l’état d’une liste', () => {
  it('lit la recherche, le tri et la pagination en valeurs resultset', () => {
    expect(
      liste.charger(
        '?recherche=maison&tri=creation&ordre=desc&page=3&lignes=50',
      ),
    ).toStrictEqual({
      recherche: Search('maison'),
      types: [],
      tri: Sort('creation', 'desc'),
      pagination: { page: Page(3), pageSize: PageSize(50) },
    })
  })

  it('rend les valeurs par défaut quand l’URL est vide', () => {
    expect(liste.charger('')).toStrictEqual({
      recherche: Search(''),
      types: [],
      tri: Sort('nom', 'asc'),
      pagination: { page: Page(1), pageSize: PageSize(20) },
    })
  })

  it('garde les virgules et retire les espaces autour de la recherche', () => {
    expect(liste.charger({ recherche: '  Dupont, Jean ' }).recherche).toBe(
      'Dupont, Jean',
    )
  })

  it('revient à la colonne par défaut pour une colonne inconnue', () => {
    expect(liste.charger('?tri=siret&ordre=desc').tri).toStrictEqual(
      Sort('nom', 'desc'),
    )
  })

  it('revient au sens par défaut pour un sens inconnu', () => {
    expect(liste.charger('?tri=creation&ordre=bas').tri).toStrictEqual(
      Sort('creation', 'asc'),
    )
  })

  it.each([
    ['une page nulle', '?page=0'],
    ['une page négative', '?page=-2'],
    ['une page décimale', '?page=1.5'],
    ['une page non numérique', '?page=abc'],
  ])('revient à la première page pour %s', (_, requete) => {
    expect(liste.charger(requete).pagination.page).toBe(1)
  })

  it('revient au nombre de lignes par défaut pour un nombre non proposé', () => {
    expect(liste.charger('?lignes=10000').pagination.pageSize).toBe(20)
  })

  it('compose une pagination seule', () => {
    expect(composerLEtat(paginationDesLieux).charger('?page=2')).toStrictEqual({
      pagination: { page: Page(2), pageSize: PageSize(20) },
    })
  })

  it('compose un tri seul', () => {
    expect(composerLEtat(triDesLieux).charger('')).toStrictEqual({
      tri: Sort('nom', 'asc'),
    })
  })
})

describe('écriture de l’état d’une liste', () => {
  it('écrit un tri sous ses deux clés', () => {
    expect(liste.adresse(adresse({}), { tri: Sort('creation', 'desc') })).toBe(
      '/lieux?tri=creation&ordre=desc',
    )
  })

  it('n’écrit pas les valeurs par défaut', () => {
    expect(
      liste.adresse(adresse({}), {
        tri: Sort('nom', 'asc'),
        pagination: { page: Page(1), pageSize: PageSize(20) },
      }),
    ).toBe('/lieux')
  })

  it('efface les filtres, la recherche et la page, mais garde le tri et les lignes', () => {
    expect(
      liste.sansFiltres(
        adresse({
          recherche: 'maison',
          types: 'collectif',
          tri: 'creation',
          lignes: '50',
          page: '3',
        }),
      ),
    ).toBe('/lieux?tri=creation&lignes=50')
  })

  it('retire une étiquette en revenant à la première page', () => {
    const parametres = { types: 'collectif', tri: 'creation', page: '3' }
    expect(
      liste.etiquettes(adresse(parametres), liste.charger(parametres)).at(0)
        ?.href,
    ).toBe('/lieux?tri=creation')
  })
})

describe('liens de tri', () => {
  const parametres = { tri: 'creation', ordre: 'asc', page: '2', lignes: '50' }

  it('inverse le sens de la colonne active, en revenant à la première page', () => {
    expect(
      liste.tri.lien(
        adresse(parametres),
        liste.charger(parametres),
        'creation',
      ),
    ).toStrictEqual({
      href: '/lieux?tri=creation&ordre=desc&lignes=50',
      actif: true,
      ordre: 'desc',
    })
  })

  it('trie une autre colonne en ascendant', () => {
    expect(
      liste.tri.lien(adresse(parametres), liste.charger(parametres), 'nom')
        .href,
    ).toBe('/lieux?lignes=50')
  })

  it('donne un lien pour chaque colonne déclarée', () => {
    expect(
      Object.keys(liste.tri.liens(adresse({}), liste.charger(''))),
    ).toStrictEqual(['nom', 'creation'])
  })
})

describe('liens de pagination', () => {
  const parametres = { types: 'collectif', page: '2' }
  const liens = liste.pagination.liens(adresse(parametres), {
    totalItems: 55,
    currentPage: 2,
    pageSize: 20,
  })

  it('numérote les pages en gardant les filtres', () => {
    expect(liens.pages).toStrictEqual([
      { numero: 1, courante: false, href: '/lieux?types=collectif' },
      { numero: 2, courante: true, href: '/lieux?types=collectif&page=2' },
      { numero: 3, courante: false, href: '/lieux?types=collectif&page=3' },
    ])
  })

  it('mène aux pages voisines et aux extrémités', () => {
    expect([
      liens.premiere,
      liens.precedente,
      liens.suivante,
      liens.derniere,
    ]).toStrictEqual([
      '/lieux?types=collectif',
      '/lieux?types=collectif',
      '/lieux?types=collectif&page=3',
      '/lieux?types=collectif&page=3',
    ])
  })

  it('n’a ni page précédente ni première page depuis la première', () => {
    const depuisLaPremiere = liste.pagination.liens(adresse({}), {
      totalItems: 55,
      currentPage: 1,
      pageSize: 20,
    })
    expect([
      depuisLaPremiere.premiere,
      depuisLaPremiere.precedente,
    ]).toStrictEqual([null, null])
  })
})

describe('capacités selon les pièces composées', () => {
  it('n’offre pas de tri à une pagination seule', () => {
    expectTypeOf(composerLEtat(paginationDesLieux)).not.toHaveProperty('tri')
  })

  it('n’offre pas de pagination à un tri seul', () => {
    expectTypeOf(composerLEtat(triDesLieux)).not.toHaveProperty('pagination')
  })

  it('n’offre pas d’étiquettes sans filtre', () => {
    expectTypeOf(composerLEtat(rechercheLibre, triDesLieux)).not.toHaveProperty(
      'etiquettes',
    )
  })

  it('n’accepte que les colonnes déclarées', () => {
    expectTypeOf(liste.tri.lien)
      .parameter(2)
      .toEqualTypeOf<'nom' | 'creation'>()
  })
})
