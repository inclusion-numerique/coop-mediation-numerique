import { describe, expect, it } from 'vitest'
import {
  parametresDesStatistiques,
  parametresDesStatistiquesPartagees,
} from './parametres-de-la-page'

describe('paramètres de la page des statistiques', () => {
  it('lit la fin du graphique', () => {
    expect(
      parametresDesStatistiques({ graphique_fin: '2026-06-30' }).graphOptions,
    ).toStrictEqual({ fin: new Date('2026-06-30') })
  })

  it('laisse la fin du graphique libre quand elle manque', () => {
    expect(parametresDesStatistiques({}).graphOptions).toStrictEqual({
      fin: undefined,
    })
  })

  it('écarte un filtre invalide', () => {
    expect(
      parametresDesStatistiques({ du: '30/06/2026' }).activitesFilters.du,
    ).toBeUndefined()
  })

  it('garde un filtre valide', () => {
    expect(
      parametresDesStatistiques({ du: '2026-01-01' }).activitesFilters.du,
    ).toBe('2026-01-01')
  })
})

describe('paramètres de la page des statistiques partagées', () => {
  it("arrête la période à aujourd'hui quand elle n'a pas de fin", () => {
    expect(
      parametresDesStatistiquesPartagees(
        {},
        new Date('2026-11-19T10:00:00.000Z'),
      ).activitesFilters.au,
    ).toBe('2026-11-19')
  })

  it('garde la fin de période demandée', () => {
    expect(
      parametresDesStatistiquesPartagees(
        { au: '2026-03-31' },
        new Date('2026-11-19T10:00:00.000Z'),
      ).activitesFilters.au,
    ).toBe('2026-03-31')
  })

  it('ignore le filtre des bénéficiaires d’un partage', () => {
    expect(
      parametresDesStatistiquesPartagees({
        beneficiaires: ['00000000-0000-4000-8000-000000000001'],
      }).activitesFilters.beneficiaires,
    ).toBeUndefined()
  })
})
