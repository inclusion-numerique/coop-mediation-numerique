import { describe, expect, it } from 'vitest'
import {
  Courriel,
  MediateurId,
  NomAffiche,
  RoleMembre,
} from '../../../../domain/index'
import { ajouter, type PersonneAInviter } from './personne-a-inviter.form-data'

const edith: PersonneAInviter = {
  _tag: 'Mediateur',
  mediateurId: MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'),
  nom: NomAffiche('Edith Piaf'),
  email: Courriel('edith@piaf.com'),
  role: RoleMembre('MediateurNumerique'),
}

describe('ajouter', () => {
  it('ajoute une personne à la sélection', () => {
    expect(ajouter([], edith)).toEqual([edith])
  })

  it("n'ajoute pas deux fois la même adresse, quelle qu'en soit la casse saisie", () => {
    expect(
      ajouter([edith], {
        _tag: 'Email',
        email: Courriel('Edith@Piaf.com'),
      }),
    ).toEqual([edith])
  })
})
