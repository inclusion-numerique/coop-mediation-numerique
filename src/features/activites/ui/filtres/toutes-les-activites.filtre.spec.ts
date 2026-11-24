import { describe, expect, it } from 'vitest'
import { criteresDesActivites, criteresDesStatistiques } from '../../domain'
import {
  criteresDesFiltres,
  criteresDesStatistiquesDesFiltres,
} from './activites.filtre'
import { filtresDeToutesLesActivites } from './toutes-les-activites.filtre'

const UNE_URL_COMPLETE = {
  du: '2026-01-01',
  au: '2026-03-31',
  types: 'individuel,collectif',
  rdvs: 'seen,noshow',
  mediateurs: '0b8a1c2d-3e4f-4a5b-8c9d-0e1f2a3b4c5d',
  beneficiaires: '1b8a1c2d-3e4f-4a5b-8c9d-0e1f2a3b4c5d,pas-un-uuid',
  lieux: '3f0c3a5e-1b4c-4b8e-9a63-2f2a8d0f1a11',
  communes: '69123',
  departements: '69',
  conseiller_numerique: '0',
  demarches_administratives: '1',
  rdv: '0',
  thematiqueNonAdministratives: 'Email,Sante',
  thematiqueAdministratives: 'Logement',
  tags: 'a6b1c9d2-7e3f-4a5b-8c9d-0e1f2a3b4c5d',
  structuresEmployeuses: '12',
  source: 'v1',
}

describe('tous les filtres des activités', () => {
  it('lisent une URL complète comme le domaine lisait les activités', () => {
    expect(
      criteresDesFiltres(filtresDeToutesLesActivites.charger(UNE_URL_COMPLETE)),
    ).toStrictEqual(criteresDesActivites(UNE_URL_COMPLETE))
  })

  it('lisent une URL complète comme le domaine lisait les statistiques', () => {
    expect(
      criteresDesStatistiquesDesFiltres(
        filtresDeToutesLesActivites.charger(UNE_URL_COMPLETE),
      ),
    ).toStrictEqual(criteresDesStatistiques(UNE_URL_COMPLETE))
  })
})
