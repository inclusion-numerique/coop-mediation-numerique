import { affectationActuelle, estConseillerNumerique } from './affectation'
import { affectation } from './employeuse.fixture'

describe('affectationActuelle', () => {
  it('priorise idposte sur coop — le dispositif fait autorité', () => {
    const actuelle = affectationActuelle([
      affectation('coop', 1),
      affectation('idposte', 2),
    ])
    expect(actuelle?.employeuse.id).toBe(2)
  })

  it('retombe sur coop quand il n’y a pas d’idposte', () => {
    const actuelle = affectationActuelle([
      affectation('aidants-connect', 3),
      affectation('coop', 1),
    ])
    expect(actuelle?.employeuse.id).toBe(1)
  })

  it('à source égale, retient la plus récemment enregistrée', () => {
    const actuelle = affectationActuelle([
      affectation('coop', 1, new Date('2025-01-01')),
      affectation('coop', 2, new Date('2026-06-01')),
    ])
    expect(actuelle?.employeuse.id).toBe(2)
  })

  it('n’a pas d’employeuse courante sans affectation', () => {
    expect(affectationActuelle([])).toBeNull()
  })
})

describe('estConseillerNumerique', () => {
  it('reconnaît une affectation idposte active', () => {
    expect(estConseillerNumerique([affectation('idposte', 1)])).toBe(true)
  })

  // Le cœur du sujet : la fin du contrat conum se traduit par la DÉSACTIVATION de
  // l'affectation côté Entrepôt. Sans cette lecture, le drapeau restait vrai jusqu'à
  // ce qu'une synchro nocturne veuille bien le corriger.
  it('ne reconnaît pas une affectation idposte désactivée', () => {
    expect(
      estConseillerNumerique([{ ...affectation('idposte', 1), active: false }]),
    ).toBe(false)
  })

  it('ne confond pas le déclaratif coop avec le dispositif', () => {
    expect(estConseillerNumerique([affectation('coop', 1)])).toBe(false)
  })

  it('reste vrai si le dispositif coexiste avec une affectation déclarée', () => {
    expect(
      estConseillerNumerique([
        affectation('coop', 1),
        affectation('idposte', 2),
      ]),
    ).toBe(true)
  })

  it('est faux sans aucune affectation', () => {
    expect(estConseillerNumerique([])).toBe(false)
  })
})
