import { describe, expect, it } from 'vitest'
import { type ContenuDuCompte, communs } from './apercu-de-fusion'

const vide: ContenuDuCompte = {
  beneficiaires: [],
  activites: [],
  structuresEmployeuses: [],
  lieuxActivite: [],
  equipesRejointes: [],
  mediateursCoordonnes: [],
  invitationsRecues: [],
  invitationsEnvoyees: [],
  mutations: [],
  tags: [],
}

const source: ContenuDuCompte = {
  beneficiaires: ['b1', 'b2'],
  activites: ['a1'],
  structuresEmployeuses: ['s1'],
  lieuxActivite: ['l1', 'l2'],
  equipesRejointes: ['e1'],
  mediateursCoordonnes: ['m1'],
  invitationsRecues: ['ir1'],
  invitationsEnvoyees: ['ie1'],
  mutations: ['mu1'],
  tags: ['t1', 't2'],
}

const cible: ContenuDuCompte = {
  beneficiaires: ['b2', 'b3'],
  activites: ['a2'],
  structuresEmployeuses: ['s1'],
  lieuxActivite: ['l2'],
  equipesRejointes: ['e1'],
  mediateursCoordonnes: ['m2'],
  invitationsRecues: ['ir1'],
  invitationsEnvoyees: ['ie2'],
  mutations: ['mu1'],
  tags: ['t2'],
}

describe('éléments communs aux deux comptes à fusionner', () => {
  it('retient, catégorie par catégorie, les éléments présents dans les deux comptes', () => {
    expect(communs(source, cible)).toEqual({
      ...vide,
      beneficiaires: ['b2'],
      structuresEmployeuses: ['s1'],
      lieuxActivite: ['l2'],
      equipesRejointes: ['e1'],
      invitationsRecues: ['ir1'],
      mutations: ['mu1'],
      tags: ['t2'],
    })
  })
})
