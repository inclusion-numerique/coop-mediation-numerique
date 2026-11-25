import { describe, expect, it } from 'vitest'
import { CRITERES_VIDES } from '../../domain'
import { criteresDesFiltres } from './activites.filtre'
import { filtresDeToutesLesActivites } from './toutes-les-activites.filtre'

describe('critères des filtres des activités', () => {
  it('écartent une valeur injectée dans l’URL', () => {
    expect(
      criteresDesFiltres(
        filtresDeToutesLesActivites.charger({ lieux: "x') OR 1=1 --" }),
      ),
    ).toEqual(CRITERES_VIDES)
  })
})
