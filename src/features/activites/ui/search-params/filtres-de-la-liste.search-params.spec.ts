import { describe, expect, it } from 'vitest'
import { criteresDesActivites } from '../../domain/index'
import {
  filtresDeLaListe,
  lieuxEnParametres,
  periodeEnParametres,
  plusDeFiltresEnParametres,
  sansLeFiltre,
  sansPlusDeFiltres,
  typesEnParametres,
} from './filtres-de-la-liste.search-params'

describe('filtres de la liste', () => {
  it('reprend les critères dans le vocabulaire de l’URL', () => {
    expect(
      filtresDeLaListe(
        criteresDesActivites({
          du: '2026-01-01',
          au: '2026-01-31',
          types: 'collectif',
          rdvs: 'past',
          thematiqueNonAdministratives: 'Email',
          rdv: '1',
          source: 'v1',
        }),
      ),
    ).toMatchObject({
      du: '2026-01-01',
      au: '2026-01-31',
      types: ['collectif'],
      rdvs: ['past'],
      thematiqueNonAdministratives: ['Email'],
      rdv: '1',
      source: 'v1',
    })
  })

  it('laisse vide ce qui n’est pas filtré', () => {
    expect(filtresDeLaListe(criteresDesActivites({}))).toEqual(
      expect.objectContaining({ types: undefined, lieux: undefined }),
    )
  })
})

describe('filtres de la liste en paramètres', () => {
  it('écrit les types et les statuts de rendez-vous', () => {
    expect(typesEnParametres(['individuel'], ['honore'])).toStrictEqual({
      types: 'individuel',
      rdvs: 'honore',
    })
  })

  it('écrit une période complète', () => {
    expect(
      periodeEnParametres(new Date('2026-01-01'), new Date('2026-02-01')),
    ).toStrictEqual({ du: '2026-01-01', au: '2026-02-01' })
  })

  it('retire une période incomplète', () => {
    expect(
      periodeEnParametres(undefined, new Date('2026-02-01')),
    ).toStrictEqual({ du: null, au: null })
  })

  it('écrit les lieux et revient à la première page', () => {
    expect(
      lieuxEnParametres({ lieux: [], communes: ['69382'], departements: [] }),
    ).toStrictEqual({
      lieux: null,
      communes: '69382',
      departements: null,
      page: null,
    })
  })

  it('écrit les autres filtres', () => {
    expect(
      plusDeFiltresEnParametres({
        structuresEmployeuses: [{ id: 's1' }, { id: 's2' }],
        thematiqueNonAdministratives: [],
        thematiqueAdministratives: ['logement'],
        tags: 't',
        source: 'v1',
      }),
    ).toStrictEqual({
      structuresEmployeuses: 's1,s2',
      thematiqueNonAdministratives: null,
      thematiqueAdministratives: 'logement',
      tags: 't',
      source: 'v1',
    })
  })

  it('retire les autres filtres', () => {
    expect(sansPlusDeFiltres()).toStrictEqual({
      structuresEmployeuses: null,
      thematiqueNonAdministratives: null,
      thematiqueAdministratives: null,
      tags: null,
      source: null,
    })
  })

  it("retire une valeur d'un filtre", () => {
    expect(
      sansLeFiltre(new URLSearchParams('lieux=a,b'), 'lieux', 'b'),
    ).toStrictEqual({ lieux: 'a' })
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
})
