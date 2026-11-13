import { validateActivitesFilters } from './parametres-de-la-barre'

describe('critères de la page des statistiques', () => {
  it('ne retient rien sans paramètre', () => {
    expect(
      Object.values(validateActivitesFilters({})).filter(
        (valeur) => valeur !== undefined,
      ),
    ).toEqual([])
  })

  it('lit les paramètres valides et écarte les autres', () => {
    const filtres = validateActivitesFilters({
      du: '2026-01-01',
      au: 'pas-une-date',
      types: 'collectif,individuel',
      conseiller_numerique: '2',
      graphique_fin: '2026-03-31',
    })
    expect(filtres).toMatchObject({
      du: '2026-01-01',
      types: ['collectif', 'individuel'],
    })
    expect(filtres.au).toBeUndefined()
    expect(filtres.conseiller_numerique).toBeUndefined()
    expect('graphique_fin' in filtres).toBe(false)
  })
})
