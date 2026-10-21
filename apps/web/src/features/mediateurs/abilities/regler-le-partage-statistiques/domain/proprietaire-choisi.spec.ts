import {
  CoordinateurId,
  MediateurId,
  PerimetrePartage,
} from '@app/web/features/mediateurs/domain'
import { proprietaireChoisi } from './proprietaire-choisi'

const MEDIATEUR = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const COORDINATEUR = CoordinateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')

describe('propriétaire choisi pour un partage', () => {
  it('retient le rôle du périmètre choisi', () => {
    expect(
      proprietaireChoisi(
        { mediateurId: MEDIATEUR, coordinateurId: COORDINATEUR },
        PerimetrePartage('Mediateur'),
      ),
    ).toEqual({
      success: true,
      data: { _tag: 'Mediateur', mediateurId: MEDIATEUR },
    })
  })

  it('refuse un périmètre auquel le compte n’est pas rattaché', () => {
    expect(
      proprietaireChoisi(
        { mediateurId: MEDIATEUR, coordinateurId: null },
        PerimetrePartage('Coordinateur'),
      ),
    ).toEqual({ success: false, error: { _tag: 'PerimetreNonRattache' } })
  })

  it('n’a rien à partager pour un compte sans rôle', () => {
    expect(
      proprietaireChoisi(
        { mediateurId: null, coordinateurId: null },
        PerimetrePartage('Mediateur'),
      ),
    ).toEqual({ success: false, error: { _tag: 'AucuneStatistiqueAPartager' } })
  })
})
