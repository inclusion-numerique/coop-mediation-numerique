import { describe, expect, it } from 'vitest'
import { composerLesFiltres } from '@/libraries/filtres/definition/composition'
import { filtreDePeriode } from '@/libraries/filtres/definition/filtre-de-periode'
import { criteresDesCoordinations } from '../../domain'
import { filtreDesTags } from './activites.filtre'
import {
  criteresDesFiltresDeCoordination,
  filtreDuTypeDeCoordination,
} from './coordinations.filtre'

const filtres = composerLesFiltres(
  filtreDePeriode,
  filtreDuTypeDeCoordination,
  filtreDesTags,
)

const URL_DES_COORDINATIONS = {
  du: '2026-01-01',
  au: '2026-03-31',
  types: 'Animation,Inconnu,Evenement',
  tags: 'a6b1c9d2-7e3f-4a5b-8c9d-0e1f2a3b4c5d,pas-un-uuid',
}

describe('filtres des coordinations', () => {
  it('lisent une URL des coordinations comme le faisait le domaine', () => {
    expect(
      criteresDesFiltresDeCoordination(filtres.charger(URL_DES_COORDINATIONS)),
    ).toStrictEqual(criteresDesCoordinations(URL_DES_COORDINATIONS))
  })
})
