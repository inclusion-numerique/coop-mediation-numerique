import { affectation, contrat } from './employeuse.fixture'
import { employeusesHistorique } from './employeuses-historique'

describe('employeusesHistorique', () => {
  it('retient les employeuses en cours comme passées', () => {
    const historique = employeusesHistorique(
      [affectation('coop', 1), { ...affectation('idposte', 2), active: false }],
      [],
    )

    expect(
      historique.map(({ employeuse, affectationActive }) => [
        employeuse.id,
        affectationActive,
      ]),
    ).toEqual([
      [1, true],
      [2, false],
    ])
  })

  // Une personne peut être rattachée deux fois à la même structure — une par le
  // dispositif, une par le déclaratif — et l'admin doit y voir un seul employeur.
  it('ne fait qu’une entrée d’une employeuse rattachée par deux sources', () => {
    const historique = employeusesHistorique(
      [
        { ...affectation('coop', 1, new Date('2025-01-01')), active: false },
        affectation('idposte', 1, new Date('2026-01-01')),
      ],
      [],
    )

    expect(historique).toHaveLength(1)
    // En cours dès qu'un des rattachements l'est, depuis le plus ancien des deux.
    expect(historique[0]?.affectationActive).toBe(true)
    expect(historique[0]?.depuis).toEqual(new Date('2025-01-01'))
  })

  it('rattache la période du contrat à son employeuse', () => {
    const historique = employeusesHistorique(
      [affectation('coop', 1), affectation('coop', 2)],
      [contrat(2, { debut: new Date('2026-01-01') })],
    )

    expect(historique[0]?.periode).toEqual({ _tag: 'inconnue' })
    expect(historique[1]?.periode).toEqual({
      _tag: 'enCours',
      debut: new Date('2026-01-01'),
    })
  })

  it('est vide sans aucun rattachement', () => {
    expect(employeusesHistorique([], [])).toEqual([])
  })
})
