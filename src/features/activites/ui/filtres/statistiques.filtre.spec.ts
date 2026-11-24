import { describe, expect, it } from 'vitest'
import { composerLesFiltres } from '@/libraries/filtres/definition/composition'
import { filtreDePeriode } from '@/libraries/filtres/definition/filtre-de-periode'
import { criteresDesStatistiques } from '../../domain'
import {
  criteresDesStatistiquesDesFiltres,
  filtreDeLaSource,
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDesEmployeuses,
  filtreDesLieux,
  filtreDesMediateurs,
  filtreDesTags,
  filtreDesThematiquesAdministratives,
  filtreDesThematiquesDeMediation,
  filtreDuDispositif,
  filtreDuTypeDActivite,
} from './activites.filtre'

const filtres = composerLesFiltres(
  filtreDePeriode,
  filtreDuTypeDActivite,
  filtreDesThematiquesDeMediation,
  filtreDesThematiquesAdministratives,
  filtreDeLaSource,
  filtreDesLieux,
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDesTags,
  filtreDesEmployeuses,
  filtreDesMediateurs,
  filtreDuDispositif,
)

const URL_DES_STATISTIQUES = {
  du: '2026-01-01',
  au: '2026-03-31',
  types: 'collectif',
  thematiqueNonAdministratives: 'Email',
  thematiqueAdministratives: 'Logement',
  source: 'v2',
  lieux: '3f0c3a5e-1b4c-4b8e-9a63-2f2a8d0f1a11',
  communes: '69123',
  departements: '69',
  tags: 'a6b1c9d2-7e3f-4a5b-8c9d-0e1f2a3b4c5d',
  structuresEmployeuses: '12',
  mediateurs: '0b8a1c2d-3e4f-4a5b-8c9d-0e1f2a3b4c5d,pas-un-uuid',
  conseiller_numerique: '1',
}

describe('filtres des statistiques', () => {
  it('lisent une URL des statistiques comme le faisait le domaine', () => {
    expect(
      criteresDesStatistiquesDesFiltres(filtres.charger(URL_DES_STATISTIQUES)),
    ).toStrictEqual(criteresDesStatistiques(URL_DES_STATISTIQUES))
  })

  it('gardent une période réduite à son début', () => {
    expect(
      criteresDesStatistiquesDesFiltres(filtres.charger({ du: '2026-01-01' }))
        .periode,
    ).toStrictEqual(criteresDesStatistiques({ du: '2026-01-01' }).periode)
  })
})
