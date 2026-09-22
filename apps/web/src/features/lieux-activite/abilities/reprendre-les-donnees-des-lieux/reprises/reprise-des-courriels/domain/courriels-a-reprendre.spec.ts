import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import { courrielsAReprendre } from './courriels-a-reprendre'

const verdict = (courriels: readonly string[]) =>
  courrielsAReprendre(lieuAReprendre({ courriels }))

describe('le verdict sur les courriels d’un lieu', () => {
  it('ne reproche rien à une adresse déjà sous sa forme normale', () => {
    expect(verdict(['contact@exemple.fr'])).toBeNull()
  })

  it('ramène une adresse à la casse de la nomenclature', () => {
    expect(verdict(['BATALLA.dulce@orne.fr'])).toEqual({
      conservees: ['batalla.dulce@orne.fr'],
      perdues: [],
    })
  })

  it('perd une adresse qui n’en est pas une', () => {
    expect(verdict(['pas-une-adresse'])).toEqual({
      conservees: [],
      perdues: ['pas-une-adresse'],
    })
  })

  it('ne fait tomber que l’adresse fautive, pas la liste', () => {
    expect(verdict(['contact@exemple.fr', 'pas-une-adresse'])).toEqual({
      conservees: ['contact@exemple.fr'],
      perdues: ['pas-une-adresse'],
    })
  })
})
