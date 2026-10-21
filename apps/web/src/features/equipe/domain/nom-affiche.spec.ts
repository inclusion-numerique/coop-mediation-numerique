import { Email } from './email'
import { Nom } from './nom'
import { NomAffiche, nomAffiche } from './nom-affiche'
import { Prenom } from './prenom'

const identite = {
  prenom: Prenom('Camille'),
  nom: Nom('Martin'),
  nomComplet: NomAffiche('C. Martin'),
  email: Email('camille@example.com'),
}

describe('nom affiché d’une personne', () => {
  it('privilégie le prénom et le nom', () => {
    expect(nomAffiche(identite)).toBe('Camille Martin')
  })

  it('se contente du nom seul', () => {
    expect(nomAffiche({ ...identite, prenom: null })).toBe('Martin')
  })

  it('se rabat sur le nom complet sans prénom ni nom', () => {
    expect(nomAffiche({ ...identite, prenom: null, nom: null })).toBe(
      'C. Martin',
    )
  })

  it('se rabat sur l’email en dernier recours', () => {
    expect(
      nomAffiche({ ...identite, prenom: null, nom: null, nomComplet: null }),
    ).toBe('camille@example.com')
  })
})
