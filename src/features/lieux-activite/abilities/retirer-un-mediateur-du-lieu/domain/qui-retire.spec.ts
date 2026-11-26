import { describe, expect, it } from 'vitest'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { doitEtrePrevenu, quiRetire } from './qui-retire'

const marc = MediateurId('550e8400-e29b-41d4-a716-446655440021')

describe('qui doit être prévenu du retrait d’un lieu', () => {
  it('pas le médiateur qui se retire lui-même', () => {
    expect(
      doitEtrePrevenu(
        quiRetire({
          mediateurRetire: marc,
          mediateurDeLAuteur: marc,
          estAdministrateur: false,
          coordonneLeMediateurRetire: false,
        }),
      ),
    ).toBe(false)
  })

  it('le médiateur que retire le coordinateur de son équipe', () => {
    expect(
      doitEtrePrevenu(
        quiRetire({
          mediateurRetire: marc,
          mediateurDeLAuteur: null,
          estAdministrateur: false,
          coordonneLeMediateurRetire: true,
        }),
      ),
    ).toBe(true)
  })
})
