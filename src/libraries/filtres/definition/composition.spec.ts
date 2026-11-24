import { describe, expect, it } from 'vitest'
import { composerLesFiltres } from './composition'
import { filtreDeChoix, filtreDeChoixUnique } from './filtre-de-choix'
import { filtreDePeriode } from './filtre-de-periode'
import { filtreDeRecherche } from './filtre-de-recherche'

const filtres = composerLesFiltres(
  filtreDePeriode,
  filtreDeChoix({
    cle: 'types',
    choix: { individuel: 'Individuel', collectif: 'Collectif' },
  }),
  filtreDeChoixUnique({ cle: 'source', choix: { v1: 'Import', v2: 'Coop' } }),
  filtreDeRecherche({ cle: 'lieux' }),
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

  it('écarte une valeur hors de la liste d’un choix multiple', () => {
    expect(filtres.charger('?types=individuel,inconnu').types).toStrictEqual([
      'individuel',
    ])
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
        libelle: 'Individuel',
        href: '/activites?types=collectif&lieux=a&lignes=20',
      },
      {
        libelle: 'Collectif',
        href: '/activites?types=individuel&lieux=a&lignes=20',
      },
      {
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
