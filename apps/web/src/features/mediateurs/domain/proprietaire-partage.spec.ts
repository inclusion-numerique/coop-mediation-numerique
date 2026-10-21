import { CoordinateurId } from './coordinateur-id'
import { MediateurId } from './mediateur-id'
import { PerimetrePartage } from './perimetre-partage'
import {
  proprietaireDuPerimetre,
  proprietairesPossibles,
} from './proprietaire-partage'

const MEDIATEUR = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const COORDINATEUR = CoordinateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')

const parMediateur = { _tag: 'Mediateur', mediateurId: MEDIATEUR }
const parCoordinateur = { _tag: 'Coordinateur', coordinateurId: COORDINATEUR }

describe('propriétaires possibles d’un partage', () => {
  it('un médiateur ne partage que ses statistiques', () => {
    expect(
      proprietairesPossibles({ mediateurId: MEDIATEUR, coordinateurId: null }),
    ).toEqual([parMediateur])
  })

  it('un coordinateur ne partage que celles de son équipe', () => {
    expect(
      proprietairesPossibles({
        mediateurId: null,
        coordinateurId: COORDINATEUR,
      }),
    ).toEqual([parCoordinateur])
  })

  it('un compte qui a les deux rôles peut partager les deux', () => {
    expect(
      proprietairesPossibles({
        mediateurId: MEDIATEUR,
        coordinateurId: COORDINATEUR,
      }),
    ).toEqual([parMediateur, parCoordinateur])
  })

  it('un compte sans rôle n’a rien à partager', () => {
    expect(
      proprietairesPossibles({ mediateurId: null, coordinateurId: null }),
    ).toEqual([])
  })
})

describe('propriétaire d’un périmètre choisi', () => {
  it('désigne le rôle correspondant au périmètre', () => {
    expect(
      proprietaireDuPerimetre(
        { mediateurId: MEDIATEUR, coordinateurId: COORDINATEUR },
        PerimetrePartage('Coordinateur'),
      ),
    ).toEqual(parCoordinateur)
  })

  it('ne désigne personne pour un rôle que le compte n’a pas', () => {
    expect(
      proprietaireDuPerimetre(
        { mediateurId: MEDIATEUR, coordinateurId: null },
        PerimetrePartage('Coordinateur'),
      ),
    ).toBeNull()
  })
})
