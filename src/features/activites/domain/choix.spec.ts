import { describe, expect, it } from 'vitest'
import { failure, type Result, success } from '@/libraries/result'
import { type ChoixMultiples, choixMultiplesDe } from './choix'
import { Organisateur } from './coordination/organisateur'
import { AucunChoix, ChoixEnDouble } from './errors'
import { Precision } from './precision'

const commune = Organisateur('Commune')

describe('choix multiples', () => {
  it.each<
    [
      string,
      ChoixMultiples<Organisateur>,
      Result<ChoixMultiples<Organisateur>, AucunChoix | ChoixEnDouble>,
    ]
  >([
    [
      'refuse l’absence de choix',
      { valeurs: [], autre: null },
      failure(AucunChoix()),
    ],
    [
      'refuse une valeur choisie deux fois',
      { valeurs: [commune, commune], autre: null },
      failure(ChoixEnDouble()),
    ],
    [
      'accepte des valeurs distinctes',
      { valeurs: [commune], autre: null },
      success({ valeurs: [commune], autre: null }),
    ],
    [
      'accepte une précision seule',
      { valeurs: [], autre: Precision('Association locale') },
      success({ valeurs: [], autre: Precision('Association locale') }),
    ],
  ])('%s', (_cas, choix, attendu) => {
    expect(choixMultiplesDe(choix)).toEqual(attendu)
  })
})
