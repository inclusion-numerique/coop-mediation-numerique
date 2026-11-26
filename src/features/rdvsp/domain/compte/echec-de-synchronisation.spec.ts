import { describe, expect, it } from 'vitest'
import {
  EchecDeSynchronisation,
  echecDefinitif,
} from './echec-de-synchronisation'

describe('echecDefinitif', () => {
  it.each<[string, unknown, boolean]>([
    [
      'un jeton révoqué',
      new EchecDeSynchronisation('JetonRevoque', 'JetonRevoque'),
      true,
    ],
    [
      'un accès refusé',
      new EchecDeSynchronisation('AccesRefuse', 'AccesRefuse : /rdvs'),
      true,
    ],
    [
      'un agent supprimé',
      new EchecDeSynchronisation('AgentSupprime', 'AgentSupprime : /agents'),
      true,
    ],
    [
      'une API momentanément indisponible',
      new EchecDeSynchronisation('ApiIndisponible', 'ApiIndisponible : 503'),
      false,
    ],
    ['une erreur technique quelconque', new Error('connexion perdue'), false],
  ])('tient pour définitif %s : %s', (_, erreur, attendu) => {
    expect(echecDefinitif(erreur)).toBe(attendu)
  })
})
