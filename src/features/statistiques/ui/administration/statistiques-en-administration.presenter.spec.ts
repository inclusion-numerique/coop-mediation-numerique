import { describe, expect, it } from 'vitest'
import {
  adresseDExport,
  adressesDesExports,
  bornesDuFiltreDePeriode,
  periodeChoisieDans,
  periodeDActivite,
  titreDesStatistiques,
} from './statistiques-en-administration.presenter'

describe('statistiques en administration', () => {
  it('nomme la période d’activité', () => {
    expect(periodeDActivite('2022-03-15', '2024-10-30')).toBe(
      'Du 15/03/2022 au 30/10/2024',
    )
  })

  it('signale l’absence d’activité', () => {
    expect(periodeDActivite(null, null)).toBe('Aucune activité enregistrée')
  })

  it('reporte la période choisie dans l’adresse d’export', () => {
    expect(
      adresseDExport('/export/statistiques', {
        du: '2023-01-01',
        au: '2023-12-31',
      }),
    ).toBe('/export/statistiques?du=2023-01-01&au=2023-12-31')
  })

  it('exporte toute la période sans période choisie', () => {
    expect(adresseDExport('/export/statistiques', {})).toBe(
      '/export/statistiques',
    )
  })

  it('lit la période choisie et écarte une date invalide', () => {
    expect(
      periodeChoisieDans({ du: '2023-01-01', au: 'demain', recherche: 'x' }),
    ).toEqual({ du: '2023-01-01' })
  })

  it('précise que les statistiques d’un coordinateur comprennent son équipe', () => {
    expect(titreDesStatistiques({ coordinateur: true })).toBe(
      'Statistiques, équipe comprise',
    )
  })

  it('titre simplement les statistiques d’un médiateur', () => {
    expect(titreDesStatistiques({ coordinateur: false })).toBe('Statistiques')
  })

  it('place les exports sous la fiche de l’utilisateur', () => {
    expect(adressesDesExports('42')).toEqual({
      statistiques: '/administration/utilisateurs/42/export/statistiques',
      accompagnements: '/administration/utilisateurs/42/export/accompagnements',
    })
  })

  it('borne le filtre de période à la première activité', () => {
    expect(
      bornesDuFiltreDePeriode('2022-03-15', {
        du: '2023-01-01',
        au: '2023-12-31',
      }),
    ).toEqual({
      minDate: new Date('2022-03-15'),
      defaultValue: { du: '2023-01-01', au: '2023-12-31' },
    })
  })

  it('laisse le filtre de période ouvert sans activité ni période complète', () => {
    expect(bornesDuFiltreDePeriode(null, { du: '2023-01-01' })).toEqual({
      minDate: undefined,
      defaultValue: undefined,
    })
  })
})
