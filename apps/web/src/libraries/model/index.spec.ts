import { z } from 'zod'
import { defineModel } from './index'

const Trigram = defineModel(z.string().trim().length(3).brand('Trigram'))
const Upper = defineModel(z.string().trim().toUpperCase().min(1).brand('Upper'))

describe('defineModel', () => {
  describe('partial form (throwing constructor)', () => {
    it('builds a branded value on valid input', () => {
      expect(Trigram('abc')).toBe('abc')
    })

    it('throws on invalid input', () => {
      expect(() => Trigram('toolong')).toThrow()
    })

    it('normalizes through the schema before validating', () => {
      expect(Upper(' abc ')).toBe('ABC')
    })
  })

  describe('total form (.safe)', () => {
    it('returns the branded value on valid input', () => {
      expect(Trigram.safe('abc')).toBe('abc')
    })

    it('returns null on invalid input instead of throwing', () => {
      expect(Trigram.safe('toolong')).toBeNull()
    })

    it('never throws, even on structurally wrong input', () => {
      expect(() => Trigram.safe(undefined as unknown as string)).not.toThrow()
      expect(Trigram.safe(undefined as unknown as string)).toBeNull()
    })

    it('normalizes through the schema before validating', () => {
      expect(Upper.safe(' abc ')).toBe('ABC')
    })
  })

  // Le garde-fou de la règle « la normalisation vit dans le schéma ». Un
  // préprocesseur posé à côté du schéma serait contourné ici, silencieusement :
  // `.schema` est composé, le smart constructeur ne l'est pas. C'est exactement
  // ce qui rendait la normalisation de CodeInsee inopérante dans
  // AdresseEmployeuse. Ce test échoue si quelqu'un réintroduit ce mécanisme.
  describe('composition (`.schema` imbriqué dans un autre modèle)', () => {
    const Paire = defineModel(
      z.object({ gauche: Upper.schema, droite: Trigram.schema }).brand('Paire'),
    )

    it('normalise les champs imbriqués comme le ferait leur constructeur', () => {
      expect(Paire({ gauche: ' abc ', droite: ' xyz ' })).toEqual({
        gauche: 'ABC',
        droite: 'xyz',
      })
      expect(Paire({ gauche: ' abc ', droite: ' xyz ' }).gauche).toBe(
        Upper(' abc '),
      )
    })

    it('rejette sur la validation d’un champ imbriqué', () => {
      expect(Paire.safe({ gauche: '', droite: 'xyz' })).toBeNull()
      expect(Paire.safe({ gauche: 'abc', droite: 'toolong' })).toBeNull()
    })
  })
})
