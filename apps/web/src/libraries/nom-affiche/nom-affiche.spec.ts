import { nomAffiche } from './nom-affiche'

const identite = {
  prenom: null,
  nom: null,
  nomComplet: null,
  courriel: 'camille.martin@example.org',
}

describe('nom affiché', () => {
  it('assemble le prénom et le nom', () => {
    expect(nomAffiche({ ...identite, prenom: 'Camille', nom: 'Martin' })).toBe(
      'Camille Martin',
    )
  })

  it('se contente du prénom ou du nom seul', () => {
    expect(
      nomAffiche({ ...identite, nom: 'Martin', nomComplet: 'C. M.' }),
    ).toBe('Martin')
  })

  it('se replie sur le nom complet', () => {
    expect(nomAffiche({ ...identite, nomComplet: 'Camille Martin' })).toBe(
      'Camille Martin',
    )
  })

  it('se replie sur le courriel en dernier recours', () => {
    expect(nomAffiche({ ...identite, prenom: ' ', nomComplet: '' })).toBe(
      'camille.martin@example.org',
    )
  })
})
