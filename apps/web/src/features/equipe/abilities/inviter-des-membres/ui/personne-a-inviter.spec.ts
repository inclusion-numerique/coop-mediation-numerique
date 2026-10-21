import { Email, MediateurId, NomAffiche, RoleMembre } from '../../../domain'
import { ajouter, type PersonneAInviter } from './personne-a-inviter'

const edith: PersonneAInviter = {
  _tag: 'Mediateur',
  mediateurId: MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'),
  nom: NomAffiche('Edith Piaf'),
  email: Email('edith@piaf.com'),
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
        email: Email('Edith@Piaf.com'),
      }),
    ).toEqual([edith])
  })
})
