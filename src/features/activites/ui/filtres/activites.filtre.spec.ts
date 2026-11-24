import { describe, expect, it } from 'vitest'
import { composerLesFiltres } from '@/libraries/filtres/definition/composition'
import { filtreDePeriode } from '@/libraries/filtres/definition/filtre-de-periode'
import { criteresDesActivites } from '../../domain'
import {
  criteresDesFiltres,
  filtreDeLaSource,
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDesEmployeuses,
  filtreDesLieux,
  filtreDesTags,
  filtreDesThematiquesAdministratives,
  filtreDesThematiquesDeMediation,
  filtreDuStatutDeRendezVous,
  filtreDuTypeDActivite,
} from './activites.filtre'

const filtres = composerLesFiltres(
  filtreDePeriode,
  filtreDuTypeDActivite,
  filtreDuStatutDeRendezVous,
  filtreDesThematiquesDeMediation,
  filtreDesThematiquesAdministratives,
  filtreDeLaSource,
  filtreDesLieux,
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDesTags,
  filtreDesEmployeuses,
)

const URL_DE_LA_LISTE = {
  du: '2026-01-01',
  au: '2026-03-31',
  types: 'individuel,collectif,inconnu',
  rdvs: 'seen,noshow',
  thematiqueNonAdministratives: 'Email,Sante',
  thematiqueAdministratives: 'Logement',
  source: 'v1',
  lieux: '3f0c3a5e-1b4c-4b8e-9a63-2f2a8d0f1a11,pas-un-uuid',
  communes: '69123',
  departements: '69,2A',
  tags: 'a6b1c9d2-7e3f-4a5b-8c9d-0e1f2a3b4c5d',
  structuresEmployeuses: '12,abc',
}

describe('filtres des activités', () => {
  it('lisent une URL de la liste comme le faisait le domaine', () => {
    expect(criteresDesFiltres(filtres.charger(URL_DE_LA_LISTE))).toStrictEqual(
      criteresDesActivites(URL_DE_LA_LISTE),
    )
  })

  it('lisent une URL sans filtre comme aucun critère', () => {
    expect(criteresDesFiltres(filtres.charger({}))).toStrictEqual(
      criteresDesActivites({}),
    )
  })
})
