import { aucunExamen, compter } from './compte'
import type { Verdict } from './verdict'

describe('ce que la passe de vérification des SIRET a fait', () => {
  it('part de rien', () => {
    expect(aucunExamen).toEqual({
      examines: 0,
      verifies: 0,
      siretsEffaces: 0,
      ignores: 0,
      echecs: 0,
    })
  })

  it('compte chaque verdict dans sa colonne, et l’examen dans tous les cas', () => {
    expect(compter(aucunExamen, 'verifie')).toMatchObject({
      examines: 1,
      verifies: 1,
    })
    expect(compter(aucunExamen, 'efface')).toMatchObject({
      examines: 1,
      siretsEffaces: 1,
    })
    expect(compter(aucunExamen, 'ignore')).toMatchObject({
      examines: 1,
      ignores: 1,
    })
    expect(compter(aucunExamen, 'echec')).toMatchObject({
      examines: 1,
      echecs: 1,
    })
  })

  it('accumule d’un verdict au suivant', () => {
    const verdicts: readonly Verdict[] = ['verifie', 'verifie', 'echec']
    const compte = verdicts.reduce(compter, aucunExamen)

    expect(compte).toEqual({
      examines: 3,
      verifies: 2,
      siretsEffaces: 0,
      ignores: 0,
      echecs: 1,
    })
  })

  it('ne touche pas au compte qu’on lui donne', () => {
    compter(aucunExamen, 'verifie')

    expect(aucunExamen.examines).toBe(0)
  })
})
