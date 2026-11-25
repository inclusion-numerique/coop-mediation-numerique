import { describe, expect, it } from 'vitest'
import {
  type CurseurDePage,
  curseurDeLaPage,
  pageParCurseur,
} from '@/libraries/json-api/page-par-curseur'

const lien = (curseur?: CurseurDePage): string =>
  curseur ? `/liste?${curseur.direction}=${curseur.value}` : '/liste'

const premierePage = {
  data: [],
  total: 3,
  pagination: { take: 2, skip: undefined, cursor: undefined },
  suivant: 'b',
  precedent: undefined,
  lien,
}

describe('page par curseur', () => {
  it('lit le curseur de la page précédente', () => {
    expect(
      curseurDeLaPage({ isBefore: true, take: -2, skip: 1, cursor: 'a' }),
    ).toEqual({ direction: 'before', value: 'a' })
  })

  it('n’a pas de curseur sur la première page', () => {
    expect(curseurDeLaPage(premierePage.pagination)).toBeUndefined()
  })

  it('mène à la page suivante', () => {
    expect(pageParCurseur(premierePage).links.next).toEqual({
      href: '/liste?after=b',
    })
  })

  it('n’a pas de page précédente sans curseur précédent', () => {
    expect(pageParCurseur(premierePage).links.prev).toBeUndefined()
  })

  it('compte les pages', () => {
    expect(pageParCurseur(premierePage).meta).toEqual({
      total_count: 3,
      items_per_page: 2,
      total_pages: 2,
      has_next_page: true,
      has_prev_page: false,
    })
  })
})
