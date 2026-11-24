import { describe, expect, it } from 'vitest'
import {
  adresseDesFiltres,
  choixEnParametres,
  lieuxEnParametres,
  periodeEnParametres,
  plusDeFiltresEnParametres,
  sansLeFiltre,
  sansPlusDeFiltres,
  typesEnParametres,
} from './filtres-de-la-barre.search-params'

describe('filtres de la barre en paramètres', () => {
  it('écrit les types et les statuts de rendez-vous', () => {
    expect(typesEnParametres(['Individuel'], [])).toStrictEqual({
      types: 'Individuel',
      rdvs: null,
    })
  })

  it('écrit une période complète', () => {
    expect(
      periodeEnParametres(new Date('2026-01-01'), new Date('2026-02-01')),
    ).toStrictEqual({ du: '2026-01-01', au: '2026-02-01' })
  })

  it('retire une période incomplète', () => {
    expect(periodeEnParametres(new Date('2026-01-01'))).toStrictEqual({
      du: null,
      au: null,
    })
  })

  it('écrit un choix et revient à la première page', () => {
    expect(choixEnParametres('mediateurs', ['a', 'b'])).toStrictEqual({
      mediateurs: 'a,b',
      page: null,
    })
  })

  it('écrit les lieux et revient à la première page', () => {
    expect(
      lieuxEnParametres({ lieux: ['l'], communes: [], departements: ['69'] }),
    ).toStrictEqual({
      lieux: 'l',
      communes: null,
      departements: '69',
      page: null,
    })
  })

  it('n’écrit que les filtres demandés', () => {
    expect(
      plusDeFiltresEnParametres(
        {
          conseiller_numerique: '1',
          structuresEmployeuses: [{ id: 's' }],
          tags: 't',
          source: '',
        },
        ['conseiller_numerique', 'structuresEmployeuses', 'tags', 'source'],
      ),
    ).toStrictEqual({
      conseiller_numerique: '1',
      structuresEmployeuses: 's',
      tags: 't',
      source: null,
    })
  })

  it('retire les filtres demandés', () => {
    expect(sansPlusDeFiltres(['tags', 'source'])).toStrictEqual({
      tags: null,
      source: null,
    })
  })

  it("retire une valeur d'un filtre", () => {
    expect(
      sansLeFiltre(new URLSearchParams('tags=a,b'), 'tags', 'a'),
    ).toStrictEqual({ tags: 'b' })
  })

  it('retire tous les statuts de rendez-vous', () => {
    expect(
      sansLeFiltre(new URLSearchParams('rdvs=tous'), 'rdvs', 'tous'),
    ).toStrictEqual({ rdvs: null })
  })

  it('retire un filtre fait de plusieurs paramètres', () => {
    expect(
      sansLeFiltre(new URLSearchParams('du=1&au=2'), 'periode', ['du', 'au']),
    ).toStrictEqual({ du: null, au: null })
  })

  it("pose les filtres sur l'adresse d'un export", () => {
    expect(
      adresseDesFiltres('/coop/mes-statistiques/export', {
        du: '2026-01-01',
        types: ['Individuel', 'Collectif'],
        lieux: undefined,
      }),
    ).toBe(
      '/coop/mes-statistiques/export?du=2026-01-01&types=Individuel%2CCollectif',
    )
  })
})
